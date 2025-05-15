import * as React from "react";
import * as ReactDom from "react-dom";
import { BaseClientSideWebPart } from "@microsoft/sp-webpart-base";
import RandomJoke from "./components/JokeWp";

export default class RandomJokeWebPart extends BaseClientSideWebPart<{}> {
    public render(): void {
        const element: React.ReactElement = React.createElement(RandomJoke);
        ReactDom.render(element, this.domElement);
    }
}