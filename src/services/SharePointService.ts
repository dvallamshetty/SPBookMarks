import { SPFI } from "@pnp/sp";
import { IBookmarkInfo } from "../models/IBookmarkInfo";

export class SharePointService {
    private sp: SPFI;
    constructor(sp: SPFI) {
        this.sp = sp;
    }
    public async fetchBookmarks(username: string): Promise<IBookmarkInfo[]> {
        try {
            return await this.sp.web.lists.getByTitle("BookMarks").select('Title')();
        } catch (error) {
            console.error('Error getting list info:', error);
            throw error;
        }
    }



}