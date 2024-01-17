/**
 * Similar model as returned by the API.  Minimum content for the book model.
 */
export interface Similar {
    // Make the ID or whatever it is match the book route
    _id: string;
    title: string;
    year?: number;
}
