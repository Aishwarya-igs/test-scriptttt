import { GraphQLResult } from '../graphql-helper';
import { CollectionResponse, Rail, Asset } from '../../graphql/graphql-types';

export interface CollectionAssetResult {
    rail: any;
    asset: any;
}

export interface CollectionTrailerInfo {
    title: string;
    trailerUrls: Record<string, string>;
}

export class CollectionParser {
   constructor(
        private readonly collection: GraphQLResult<CollectionResponse>
    ) {}

    getRails(): Rail[] {
        return this.collection.response.data.collection.rails;
    }

    getRailByIndex(index: number): Rail {
        return this.getRails()[index];
    }

    getCards(railIndex: number): Asset[] {
        return this.getRailByIndex(railIndex).assets.items;
    }

    getCard(railIndex: number, cardIndex: number): Asset {
        return this.getCards(railIndex)[cardIndex];
    }

    private getRailText(rail: Rail): string {
        return [rail?.title, rail?.subtitle, rail?.description].filter(Boolean).join(' ').toLowerCase();
    }

    private matchesRailPattern(railText: string, pattern: RegExp | string): boolean {
        if (typeof pattern === 'string') {
            return railText.includes(pattern.toLowerCase());
        }
        return pattern.test(railText);
    }

    findAssetInPreferredRails(
        preferredRailPatterns: Array<RegExp | string>,
        predicate: (asset: Asset) => boolean
    ): CollectionAssetResult | undefined {
        for (const pattern of preferredRailPatterns) {
            for (const rail of this.getRails()) {
                const railText = this.getRailText(rail);
                if (!this.matchesRailPattern(railText, pattern)) {
                    continue;
                }
                const asset = rail.assets?.items?.find(predicate);
                if (asset) {
                    return { rail, asset };
                }
            }
        }
        return this.findAsset(predicate);
    }

    getPreferredAssetTitle(preferredRailPatterns: Array<RegExp | string>): string {
        const result = this.findAssetInPreferredRails(preferredRailPatterns, (asset: Asset) => typeof asset.title === 'string' && asset.title.trim().length > 0);
        return String(result?.asset?.title ?? '').trim();
    }

    getPreferredRailTitles(preferredRailPatterns: Array<RegExp | string>, limit: number = 10): string[] {
        for (const pattern of preferredRailPatterns) {
            for (const rail of this.getRails()) {
                const railText = this.getRailText(rail);
                if (!this.matchesRailPattern(railText, pattern)) {
                    continue;
                }

                const titles = (rail.assets?.items ?? [])
                    .map((asset: Asset) => typeof asset.title === 'string' ? asset.title.trim() : '')
                    .filter(Boolean);

                return titles.slice(0, limit);
            }
        }

        return [];
    }
    getContentId(asset?: Asset | null): string | undefined {
        if (!asset) {
            return undefined;
        }
        const assetWithContent = asset as Asset & {
            contentId?: string;
            content?: { id?: string };
        };
        return assetWithContent.contentId
            ?? assetWithContent.content?.id
            ?? assetWithContent.id;
    }

    getContentIdByIndex(railIndex: number, cardIndex: number): string | undefined {
        return this.getContentId(this.getCard(railIndex, cardIndex));
    }

    getTotalSeasons(asset?: Asset | null): number | undefined {
        if (!asset) {
            return undefined;
        }

        const assetWithTvShowDetails = asset as Asset & {
            tvShowDetails?: {
                totalSeasons?: number | null;
            } | null;
        };

        return assetWithTvShowDetails.tvShowDetails?.totalSeasons ?? undefined;
    }

    getTotalSeasonsByIndex(railIndex: number, cardIndex: number): number | undefined {
        return this.getTotalSeasons(this.getCard(railIndex, cardIndex));
    }

    getTrailerUrls(asset?: Asset | null): Record<string, string> | undefined {
        if (!asset) {
            return undefined;
        }

        const assetWithTrailer = asset as Asset & {
            trailerUrls?: Record<string, { url?: string }>;
        };

        const trailerUrls = assetWithTrailer.trailerUrls;
        if (!trailerUrls) {
            return undefined;
        }

        return Object.entries(trailerUrls).reduce<Record<string, string>>((urls, [key, value]) => {
            if (value?.url) {
                urls[key] = value.url;
            }
            return urls;
        }, {});
    }

    getTrailerInfo(asset?: Asset | null): CollectionTrailerInfo | undefined {
        const trailerUrls = this.getTrailerUrls(asset);
        if (!asset || !trailerUrls || Object.keys(trailerUrls).length === 0) {
            return undefined;
        }

        return {
            title: asset.title,
            trailerUrls,
        };
    }

    getTrailerInfoByIndex(railIndex: number, cardIndex: number): CollectionTrailerInfo | undefined {
        return this.getTrailerInfo(this.getCard(railIndex, cardIndex));
    }

    findAsset(predicate: (asset: Asset) => boolean): CollectionAssetResult | undefined {
        for (const rail of this.getRails()) {
            const asset = rail.assets.items.find(predicate);
            if (asset) {
                return {
                    rail,
                    asset
                };
            }
        }
        return undefined;
    }

    findAssetByLabel(labelText: string): CollectionAssetResult | undefined {
        return this.findAsset(asset =>
            asset.labels?.some(
            label => label.text === labelText
            ) ?? false
        );
    }

    
}

