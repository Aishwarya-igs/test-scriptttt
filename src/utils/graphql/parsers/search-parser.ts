export interface SearchResponseMatch {
    path: string;
    value: string;
}

export class SearchParser {
    constructor(private readonly payload: unknown) {}

    findQueryMatches(query: string): SearchResponseMatch[] {
        const normalizedQuery = this.normalize(query);
        const matches: SearchResponseMatch[] = [];

        const visit = (value: unknown, path = 'root') => {
            if (typeof value === 'string') {
                const normalizedValue = this.normalize(value);
                if (normalizedValue.includes(normalizedQuery)) {
                    matches.push({ path, value });
                }
                return;
            }

            if (Array.isArray(value)) {
                value.forEach((item, index) => visit(item, `${path}[${index}]`));
                return;
            }

            if (value && typeof value === 'object') {
                Object.entries(value as Record<string, unknown>).forEach(([key, child]) => {
                    visit(child, `${path}.${key}`);
                });
            }
        };

        visit(this.payload);
        return matches;
    }

    getTitleMatches(searchQuery: string): string[] {
        const normalizedQuery = this.normalize(searchQuery);
        const matches: string[] = [];
        const seen = new Set<string>();

        const visit = (value: unknown) => {
            if (Array.isArray(value)) {
                value.forEach(item => visit(item));
                return;
            }

            if (value && typeof value === 'object') {
                const record = value as Record<string, unknown>;
                const titleValue = record.title;
                const hasCastOrGenreMatch = this.hasMatchingFieldValue(record.cast, normalizedQuery) || this.hasMatchingFieldValue(record.genres, normalizedQuery);

                if (typeof titleValue === 'string' && hasCastOrGenreMatch && !seen.has(titleValue)) {
                    seen.add(titleValue);
                    matches.push(titleValue);
                }

                Object.values(record).forEach(child => visit(child));
            }
        };

        visit(this.payload);
        return matches;
    }

    hasCastMatch(actorName: string): boolean {
        return this.getTitleMatches(actorName).length > 0;
    }

    hasGenreMatch(genreName: string): boolean {
        return this.getTitleMatches(genreName).length > 0;
    }

    getTitlesMatchingQuery(searchQuery: string): string[] {
        const normalizedQuery = this.normalize(searchQuery);
        const titles: string[] = [];
        const seen = new Set<string>();

        const visit = (value: unknown) => {
            if (Array.isArray(value)) {
                value.forEach(item => visit(item));
                return;
            }

            if (value && typeof value === 'object') {
                const record = value as Record<string, unknown>;
                const titleValue = record.title;
                if (typeof titleValue === 'string') {
                    const normalizedTitle = this.normalize(titleValue);
                    if (normalizedTitle.includes(normalizedQuery) && !seen.has(titleValue)) {
                        seen.add(titleValue);
                        titles.push(titleValue.trim());
                    }
                }
                Object.values(record).forEach(child => visit(child));
            }
        };

        visit(this.payload);
        return titles;
    }

    private hasMatchingFieldValue(value: unknown, normalizedQuery: string): boolean {
        if (typeof value === 'string') {
            return this.normalize(value).includes(normalizedQuery);
        }

        if (Array.isArray(value)) {
            return value.some(item => this.hasMatchingFieldValue(item, normalizedQuery));
        }

        if (value && typeof value === 'object') {
            return Object.values(value as Record<string, unknown>).some(child => this.hasMatchingFieldValue(child, normalizedQuery));
        }

        return false;
    }

    private normalize(value: string): string {
        return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
    }
}
