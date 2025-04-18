import { WebPartContext } from "@microsoft/sp-webpart-base";

export interface IBookMarkProps {
  Id?: number; 
  Title: string;
  Url: string;
  UserName: string;
  context:WebPartContext;
}
