declare type DOMNode = {
    tagName?: string;
    nodeName: string;
    attributes: Record<string, string>;
    children: DOMNode[];
    value?: string;
    isSelfClosing?: boolean;
};

/**
 * A basic HTML parser that takes a string of HTML and returns a simple DOM representation.
 * The parser handles basic HTML elements, attributes, and text content.
 * The DOM representation is a plain object with the following structure:
 * ```
 * {
 *     tagName?: string,
 *     nodeName: string,
 *     attributes: {
 *         [key: string]: string
 *     },
 *     children: [
 *         {
 *             tagName?: string,
 *             attributes: {
 *                 [key: string]: string
 *             },
 *             children: [...],
 *             value: string
 *         }
 *     ]
 * }
 * ```
 */
declare class DOMParser_2 {
    static selfClosingTags: Set<string>;
    static quoteText: (key: string) => string;
    tags: Set<string>;
    components: Set<string>;
    root: DOMNode;
    stack: Array<DOMNode>;
    currentNode: DOMNode;
    /**
     * Returns a simple DOM representation of the parsed HTML.
     * @param htmlString The string of HTML to be parsed.
     * @return the parsed result.
     */
    parseFromString(htmlString: string): ParseResult;
    /**
     * Parse a string of HTML and return an array of tokens
     * where each token is an object with a type property and a value property.
     *
     * @param htmlString The string of HTML to be tokenized.
     * @return The array of tokens.
     */
    tokenize(htmlString: string): Array<HTMLToken>;
    /**
     * Parse an array of tokens into a DOM representation.
     * @param tokens An array of tokens to be parsed.
     */
    parseTokens(tokens: Array<HTMLToken>): void;
    /**
     * Returns the name of the tag.
     * @param tagString A string of HTML that represents a tag.
     * @return The name of the tag.
     */
    getTagName(tagString: string): string;
    /**
     * Returns an object where the keys are the names of the attributes
     * and the values are the values of the attributes.
     *
     * @param tagString A string of HTML that represents a tag.
     * @return an object where the keys are the names of the attributes and the values are the values of the attributes.
     */
    getAttributes(tagString: string): Record<string, string>;
}
export default DOMParser_2;

declare type HTMLToken = {
    type: string;
    value: string;
    isSelfClosing?: boolean;
};

declare type ParseResult = {
    root: DOMNode;
    components: string[];
    tags: string[];
};

export { }
