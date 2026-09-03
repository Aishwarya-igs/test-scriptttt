import { GraphQLResult } from '../graphql-helper';
import { Asset } from '../../graphql/graphql-types';

export interface AssetResponse {
    data: {
        asset: Asset;
    };
}

export class AssetParser {
    constructor(
        private readonly assetResponse: GraphQLResult<AssetResponse>
    ) { }

    getAsset(): Asset {
        return this.assetResponse.response.data.asset;
    }

    getAssetTitle(): string {
        return this.getAsset().title;
    }

    getAssetLabels(): string[] {
        return this.getAsset().labels?.map(label => label.text) ?? [];
    }

    hasLabel(labelText: string): boolean {
        return this.getAsset().labels?.some(label => label.text === labelText) ?? false;
    }
}
