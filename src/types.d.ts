export type DOMNode = {
  tagName?: string;
  nodeName: string;
  attributes: Record<string, string>;
  children: DOMNode[];
  value?: string;
  isSelfClosing?: boolean;
};

export type ParseResult = {
  root: DOMNode;
  components: string[];
  tags: string[];
};

export type HTMLToken = {
  type: string;
  value: string;
  isSelfClosing?: boolean;
};
