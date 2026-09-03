// utils/graphql/types/collection.types.ts

export interface CollectionResponse {
    data: {
        collection: {
            rails: Rail[];
        };
    };
}

export interface Rail {
    id: string;
    title: string;
    subtitle?: string;
    description?: string;
    assets: {
        items: Asset[];
    };
}

export interface Asset {
    id: string;
    title: string;
    images: {
        landscape: string;
        portrait: string;
    };
    labels?: Label[];
    tvShowDetails?: {
        defaultEpisode?: {
            id: string;
        };
    };
}

export interface Label {
    id: string;
    text: string;
    position?: string;
    url?: string;
}

export interface Asset {
    id: string;
    title: string;

    images: {
        landscape: string;
        portrait: string;
    };

    labels?: Label[];
}

export interface Label {
    id: string;
    text: string;
    position?: string;
    url?: string;
}

export interface TrailerUrlEntry {
    url?: string;
}

export interface Episode {
    id: string;
    contentId?: string;
    title: string;
    assetType?: 'episode' | 'movie';
    shortDescription?: string;
    images?: {
        landscape?: string;
        landscapeHero?: string;
        portrait?: string;
        portraitHero?: string;
        title?: string;
        square?: string;
    };
    isPlayable?: boolean;
    duration?: string;
    durationInSeconds?: number;
    durationInMs?: number;
    labels?: Label[];
    trailerUrls?: Record<string, TrailerUrlEntry | undefined>;
    genres?: string[];
    releaseDate?: string;
    earlyAccessDate?: string | null;
    cast?: string[];
    contentDescriptors?: string[];
    contentOwner?: string;
    directors?: string[];
    languages?: string[];
    originalLanguage?: string;
    rating?: string;
    videoQuality?: Array<{
        id: string;
        label: string;
    }>;
    audioQuality?: Array<{
        id: string;
        label: string;
    }>;
    subtitleLanguages?: string[];
    subHeader?: string | null;
    subHeaders?: string[];
    showInfo?: {
        id: string;
        title: string;
        tvShowType?: string;
        images?: {
            landscape?: string;
            landscapeHero?: string;
            portrait?: string;
            portraitHero?: string;
            title?: string;
            square?: string;
        };
    } | null;
    tvShowDetails?: any | null;
    monetization?: {
        type?: 'free' | 'paid';
        logoUrl?: string | null;
        earlyAccess?: boolean;
        hasSkuAccess?: boolean;
    };
    seasons?: any[];
    promotionalTag?: {
        iconUrl?: string;
        text?: string;
    } | null;
    continueWatching?: {
        playbackPosition?: number;
        audioLang?: string | null;
        subtitleLang?: string;
        resolution?: string | null;
        bitrate?: string | null;
    } | null;
    videoOrientation?: string;
    synopsis?: string;
    seasonNumber?: number;
    episodeNumber?: number;
    thumbnailUrl?: string;
}

export interface TVShowEpisodesResponse {
    data: {
        tvShow?: {
            id: string;
            title: string;
            episodes: Episode[];
        };
        tvShowEpisodes?: {
            items: Episode[];
            totalItems?: number;
            pageSize?: number;
            currentPage?: number;
            totalPages?: number;
            hasNextPage?: boolean;
            hasPreviousPage?: boolean;
        };
    };
}

export interface ContinueWatchingItem extends Asset {
    assetType: 'episode' | 'movie';
    shortDescription: string;
    isPlayable: boolean;
    duration: string;
    durationInSeconds: number;
    durationInMs: number;
    trailerUrls: {
        dash: {
            url: string;
        };
    };
    genres: string[];
    releaseDate: string;
    earlyAccessDate: string | null;
    cast: string[];
    contentDescriptors: string[];
    contentOwner: string;
    directors: string[];
    languages: string[];
    originalLanguage: string;
    rating: string;
    videoQuality: Array<{
        id: string;
        label: string;
    }>;
    audioQuality: Array<{
        id: string;
        label: string;
    }>;
    subtitleLanguages: string[];
    subHeader: string | null;
    subHeaders: string[];
    showInfo: {
        id: string;
        title: string;
        tvShowType: string;
        images: {
            landscape: string;
            landscapeHero: string;
            portrait: string;
            portraitHero: string;
            title: string;
            square: string;
        };
    } | null;
    tvShowDetails: any | null;
    monetization: {
        type: 'free' | 'paid';
        logoUrl: string | null;
        earlyAccess: boolean;
        hasSkuAccess: boolean;
    };
    seasons: any[];
    promotionalTag: {
        iconUrl: string;
        text: string;
    } | null;
    continueWatching: {
        playbackPosition: number;
        audioLang: string | null;
        subtitleLang: string;
        resolution: string | null;
        bitrate: string | null;
    };
    videoOrientation: string;
}

export interface PaginationInfo {
    totalItems: number;
    pageSize: number;
    currentPage: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

export interface ContinueWatchingResponse {
    data: {
        continueWatching: {
            items: ContinueWatchingItem[];
            totalItems: number;
            pageSize: number;
            currentPage: number;
            totalPages: number;
            hasNextPage: boolean;
            hasPreviousPage: boolean;
        };
    };
}