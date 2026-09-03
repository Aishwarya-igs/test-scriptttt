import { GraphQLResult } from '../graphql-helper';
import { Episode, PaginationInfo, TVShowEpisodesResponse } from '../../graphql/graphql-types';

export interface TVShowEpisodeResult {
    episode: Episode;
    index: number;
}

export interface TVShowEpisodeTrailerInfo {
    title: string;
    trailerUrls: Record<string, string>;
}

export class TVShowEpisodesParser {
    constructor(
        private readonly response: GraphQLResult<TVShowEpisodesResponse>
    ) { }

    private getEpisodeContainer() {
        const { tvShow, tvShowEpisodes } = this.response.response.data;

        if (tvShowEpisodes) {
            return tvShowEpisodes;
        }

        if (tvShow) {
            return {
                items: tvShow.episodes,
            };
        }

        return {
            items: [] as Episode[],
        };
    }

    getTVShowTitle(): string | undefined {
        return this.response.response.data.tvShow?.title;
    }

    getTVShowId(): string | undefined {
        return this.response.response.data.tvShow?.id;
    }

    getEpisodes(): Episode[] {
        return this.getEpisodeContainer().items;
    }

    getEpisodeByIndex(index: number): Episode | undefined {
        return this.getEpisodes()[index];
    }

    getContentId(asset?: Episode | null): string | undefined {
        if (!asset) {
            return undefined;
        }

        return asset.contentId ?? asset.id;
    }

    getTrailerUrls(asset?: Episode | null): Record<string, string> | undefined {
        if (!asset) {
            return undefined;
        }

        const trailerUrls = asset.trailerUrls;
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

    getTrailerInfo(asset?: Episode | null): TVShowEpisodeTrailerInfo | undefined {
        const trailerUrls = this.getTrailerUrls(asset);
        if (!asset || !trailerUrls || Object.keys(trailerUrls).length === 0) {
            return undefined;
        }

        return {
            title: asset.title,
            trailerUrls,
        };
    }

    findEpisode(predicate: (episode: Episode) => boolean): Episode | undefined {
        return this.getEpisodes().find(predicate);
    }

    findEpisodeWithIndex(predicate: (episode: Episode) => boolean): TVShowEpisodeResult | undefined {
        const episodes = this.getEpisodes();
        for (let index = 0; index < episodes.length; index += 1) {
            if (predicate(episodes[index])) {
                return {
                    episode: episodes[index],
                    index,
                };
            }
        }

        return undefined;
    }

    findEpisodeByTitle(title: string): Episode | undefined {
        return this.findEpisode(episode => episode.title === title);
    }

    findEpisodeByLabel(labelText: string): Episode | undefined {
        return this.findEpisode(episode =>
            episode.labels?.some(label => label.text === labelText) ?? false
        );
    }

    hasEpisode(title: string): boolean {
        return !!this.findEpisodeByTitle(title);
    }

    getPaginationInfo(): PaginationInfo {
        const container = this.getEpisodeContainer();
        return {
            totalItems: container.totalItems ?? 0,
            pageSize: container.pageSize ?? 0,
            currentPage: container.currentPage ?? 0,
            totalPages: container.totalPages ?? 0,
            hasNextPage: container.hasNextPage ?? false,
            hasPreviousPage: container.hasPreviousPage ?? false,
        };
    }

    getTotalItems(): number {
        return this.getPaginationInfo().totalItems;
    }

    hasNextPage(): boolean {
        return this.getPaginationInfo().hasNextPage;
    }

    hasPreviousPage(): boolean {
        return this.getPaginationInfo().hasPreviousPage;
    }

    getCurrentPage(): number {
        return this.getPaginationInfo().currentPage;
    }

    getTotalPages(): number {
        return this.getPaginationInfo().totalPages;
    }
}
