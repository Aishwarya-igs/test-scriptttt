import { GraphQLResult } from '../graphql-helper';
import { ContinueWatchingResponse, ContinueWatchingItem, PaginationInfo } from '../graphql-types';

export interface ContinueWatchingAssetResult {
    item: ContinueWatchingItem;
    index: number;
}

export class ContinueWatchingParser {
    constructor(
        private readonly response: GraphQLResult<ContinueWatchingResponse>
    ) {}

    /**
     * Get all continue watching items
     */
    getItems(): ContinueWatchingItem[] {
        return this.response.response.data.continueWatching.items;
    }

    /**
     * Get item at specific index
     */
    getItemByIndex(index: number): ContinueWatchingItem | undefined {
        return this.getItems()[index];
    }

    /**
     * Get item by asset ID
     */
    getItemById(id: string): ContinueWatchingItem | undefined {
        return this.findItem(item => item.id === id);
    }

    /**
     * Find first item matching predicate
     */
    findItem(predicate: (item: ContinueWatchingItem) => boolean): ContinueWatchingItem | undefined {
        return this.getItems().find(predicate);
    }

    /**
     * Find item with index by predicate
     */
    findItemWithIndex(predicate: (item: ContinueWatchingItem) => boolean): ContinueWatchingAssetResult | undefined {
        const items = this.getItems();
        for (let i = 0; i < items.length; i++) {
            if (predicate(items[i])) {
                return { item: items[i], index: i };
            }
        }
        return undefined;
    }

    /**
     * Find all items matching predicate
     */
    findItems(predicate: (item: ContinueWatchingItem) => boolean): ContinueWatchingItem[] {
        return this.getItems().filter(predicate);
    }

    /**
     * Find item by title
     */
    getItemByTitle(title: string): ContinueWatchingItem | undefined {
        return this.findItem(item => item.title === title);
    }

    /**
     * Find item by show title
     */
    getItemByShowTitle(showTitle: string): ContinueWatchingItem | undefined {
        return this.findItem(item => item.showInfo?.title === showTitle);
    }

    /**
     * Get all items for a specific show
     */
    getItemsByShowTitle(showTitle: string): ContinueWatchingItem[] {
        return this.findItems(item => item.showInfo?.title === showTitle);
    }

    /**
     * Find item by asset type
     */
    getItemsByAssetType(assetType: 'episode' | 'movie'): ContinueWatchingItem[] {
        return this.findItems(item => item.assetType === assetType);
    }

    /**
     * Find items by monetization type
     */
    getItemsByMonetizationType(type: 'free' | 'paid'): ContinueWatchingItem[] {
        return this.findItems(item => item.monetization.type === type);
    }

    /**
     * Find items by content rating
     */
    getItemsByRating(rating: string): ContinueWatchingItem[] {
        return this.findItems(item => item.rating === rating);
    }

    /**
     * Find items by genre
     */
    getItemsByGenre(genre: string): ContinueWatchingItem[] {
        return this.findItems(item => item.genres?.includes(genre) ?? false);
    }

    /**
     * Get playback position for item
     */
    getPlaybackPosition(itemId: string): number | undefined {
        const item = this.getItemById(itemId);
        return item?.continueWatching?.playbackPosition;
    }

    /**
     * Get continue watching info for item
     */
    getContinueWatchingInfo(itemId: string) {
        const item = this.getItemById(itemId);
        return item?.continueWatching;
    }

    /**
     * Get subtitle language for item
     */
    getSubtitleLanguage(itemId: string): string | undefined {
        const item = this.getItemById(itemId);
        return item?.continueWatching?.subtitleLang;
    }

    /**
     * Get audio language for item
     */
    getAudioLanguage(itemId: string): string | null | undefined {
        const item = this.getItemById(itemId);
        return item?.continueWatching?.audioLang;
    }

    /**
     * Get pagination info
     */
    getPaginationInfo(): PaginationInfo {
        const cw = this.response.response.data.continueWatching;
        return {
            totalItems: cw.totalItems,
            pageSize: cw.pageSize,
            currentPage: cw.currentPage,
            totalPages: cw.totalPages,
            hasNextPage: cw.hasNextPage,
            hasPreviousPage: cw.hasPreviousPage
        };
    }

    /**
     * Get total number of items
     */
    getTotalItems(): number {
        return this.response.response.data.continueWatching.totalItems;
    }

    /**
     * Check if there is a next page
     */
    hasNextPage(): boolean {
        return this.response.response.data.continueWatching.hasNextPage;
    }

    /**
     * Check if there is a previous page
     */
    hasPreviousPage(): boolean {
        return this.response.response.data.continueWatching.hasPreviousPage;
    }

    /**
     * Get current page number
     */
    getCurrentPage(): number {
        return this.response.response.data.continueWatching.currentPage;
    }

    /**
     * Get total number of pages
     */
    getTotalPages(): number {
        return this.response.response.data.continueWatching.totalPages;
    }

    /**
     * Get show title for item
     */
    getShowTitle(itemId: string): string | undefined {
        const item = this.getItemById(itemId);
        return item?.showInfo?.title;
    }

    /**
     * Get show ID for item
     */
    getShowId(itemId: string): string | undefined {
        const item = this.getItemById(itemId);
        return item?.showInfo?.id;
    }

    /**
     * Get asset type for item
     */
    getAssetType(itemId: string): 'episode' | 'movie' | undefined {
        const item = this.getItemById(itemId);
        return item?.assetType;
    }

    /**
     * Get rating for item
     */
    getRating(itemId: string): string | undefined {
        const item = this.getItemById(itemId);
        return item?.rating;
    }

    /**
     * Check if item is playable
     */
    isPlayable(itemId: string): boolean {
        const item = this.getItemById(itemId);
        return item?.isPlayable ?? false;
    }

    /**
     * Check if item has early access
     */
    hasEarlyAccess(itemId: string): boolean {
        const item = this.getItemById(itemId);
        return item?.monetization?.earlyAccess ?? false;
    }

    /**
     * Get duration in seconds for item
     */
    getDurationInSeconds(itemId: string): number | undefined {
        const item = this.getItemById(itemId);
        return item?.durationInSeconds;
    }

    /**
     * Get duration string for item (HH:MM:SS format)
     */
    getDuration(itemId: string): string | undefined {
        const item = this.getItemById(itemId);
        return item?.duration;
    }

    /**
     * Get video qualities available for item
     */
    getVideoQualities(itemId: string): Array<{ id: string; label: string }> | undefined {
        const item = this.getItemById(itemId);
        return item?.videoQuality;
    }

    /**
     * Get audio qualities available for item
     */
    getAudioQualities(itemId: string): Array<{ id: string; label: string }> | undefined {
        const item = this.getItemById(itemId);
        return item?.audioQuality;
    }

    /**
     * Get subtitle languages available for item
     */
    getAvailableSubtitleLanguages(itemId: string): string[] | undefined {
        const item = this.getItemById(itemId);
        return item?.subtitleLanguages;
    }

    /**
     * Get landscape image URL for item
     */
    getLandscapeImage(itemId: string): string | undefined {
        const item = this.getItemById(itemId);
        return item?.images?.landscape;
    }

    /**
     * Get portrait image URL for item
     */
    getPortraitImage(itemId: string): string | undefined {
        const item = this.getItemById(itemId);
        return item?.images?.portrait;
    }

    /**
     * Check if item has specific label
     */
    hasLabel(itemId: string, labelText: string): boolean {
        const item = this.getItemById(itemId);
        return item?.labels?.some(label => label.text === labelText) ?? false;
    }

    /**
     * Get all labels for item
     */
    getLabels(itemId: string): string[] {
        const item = this.getItemById(itemId);
        return item?.labels?.map(label => label.text) ?? [];
    }

    /**
     * Get short description for item
     */
    getShortDescription(itemId: string): string | undefined {
        const item = this.getItemById(itemId);
        return item?.shortDescription;
    }

    /**
     * Get cast for item
     */
    getCast(itemId: string): string[] | undefined {
        const item = this.getItemById(itemId);
        return item?.cast;
    }

    /**
     * Get genres for item
     */
    getGenres(itemId: string): string[] | undefined {
        const item = this.getItemById(itemId);
        return item?.genres;
    }

    /**
     * Get directors for item
     */
    getDirectors(itemId: string): string[] | undefined {
        const item = this.getItemById(itemId);
        return item?.directors;
    }

    /**
     * Get available languages for item
     */
    getAvailableLanguages(itemId: string): string[] | undefined {
        const item = this.getItemById(itemId);
        return item?.languages;
    }

    /**
     * Get sub header for item (e.g., "S1 E3")
     */
    getSubHeader(itemId: string): string | null | undefined {
        const item = this.getItemById(itemId);
        return item?.subHeader;
    }

    /**
     * Get sub headers for item
     */
    getSubHeaders(itemId: string): string[] | undefined {
        const item = this.getItemById(itemId);
        return item?.subHeaders;
    }

    /**
     * Get promotional tag for item
     */
    getPromotionalTag(itemId: string): { iconUrl: string; text: string } | null | undefined {
        const item = this.getItemById(itemId);
        return item?.promotionalTag;
    }

    /**
     * Check if item has promotional tag
     */
    hasPromotionalTag(itemId: string): boolean {
        const item = this.getItemById(itemId);
        return item?.promotionalTag !== null && item?.promotionalTag !== undefined;
    }

    /**
     * Get items that have been partially watched (playback position > 0)
     */
    getPartiallyWatchedItems(): ContinueWatchingItem[] {
        return this.findItems(item => item.continueWatching?.playbackPosition > 0);
    }

    /**
     * Get items that have not been started (playback position = 0)
     */
    getUnwatchedItems(): ContinueWatchingItem[] {
        return this.findItems(item => item.continueWatching?.playbackPosition === 0);
    }

    /**
     * Get items sorted by playback position (descending)
     */
    getItemsSortedByPlaybackPosition(descending = true): ContinueWatchingItem[] {
        const sorted = [...this.getItems()].sort(
            (a, b) => (a.continueWatching?.playbackPosition ?? 0) - (b.continueWatching?.playbackPosition ?? 0)
        );
        return descending ? sorted.reverse() : sorted;
    }

    /**
     * Get items by content owner
     */
    getItemsByContentOwner(owner: string): ContinueWatchingItem[] {
        return this.findItems(item => item.contentOwner === owner);
    }

    /**
     * Get count of items by asset type
     */
    getAssetTypeCount(): { episodes: number; movies: number } {
        const items = this.getItems();
        return {
            episodes: items.filter(item => item.assetType === 'episode').length,
            movies: items.filter(item => item.assetType === 'movie').length
        };
    }

    /**
     * Get items grouped by show title
     */
    getItemsGroupedByShow(): Map<string, ContinueWatchingItem[]> {
        const grouped = new Map<string, ContinueWatchingItem[]>();
        this.getItems().forEach(item => {
            const showTitle = item.showInfo?.title ?? 'Unknown Show';
            if (!grouped.has(showTitle)) {
                grouped.set(showTitle, []);
            }
            grouped.get(showTitle)!.push(item);
        });
        return grouped;
    }
}
