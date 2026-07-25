import { TagBuilder } from "../core/builder.ts";
import { Component } from "./component.ts";

export interface CardProps {
  title: string;
  children?: HTMLElement[];
}

/** Composant de composition : un titre fixe et un slot pour du contenu personnalisé. */
export class Card extends Component<CardProps> {
  render(): HTMLElement {
    const body = new TagBuilder("div").withClass("card-body");
    for (const child of this.props.children ?? []) {
      body.withChild(child);
    }

    return new TagBuilder("div")
      .withClass("card")
      .withChild(new TagBuilder("h3").withClass("card-title").withText(this.props.title).build())
      .withChild(body.build())
      .build();
  }
}
