export type ClarityClassName =
    | 'background'
    | 'blue'
    | 'bold'
    | 'breakSpaces'
    | 'center'
    | 'communityDescription'
    | 'descriptionDivider'
    | 'enhancedArrow'
    | 'green'
    | 'link'
    | 'purple'
    | 'pve'
    | 'pvp'
    | 'spacer'
    | 'title'
    | 'yellow';

export interface ClarityLineContent {
    text?: string;
    classNames?: ClarityClassName[];
    link?: string;
}

export interface ClarityLine {
    linesContent?: ClarityLineContent[];
    classNames?: ClarityClassName[];
}

export interface ClarityPerkData {
    hash: number;
    name: string;
    itemHash?: number;
    itemName?: string;
    descriptions: {
        en?: ClarityLine[];
        // we can support other languages later if needed
    };
}

export interface ClarityDatabase {
    [perkHash: string]: ClarityPerkData;
}
