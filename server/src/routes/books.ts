import { Router } from 'express';
import { collections } from '../database.js';
import { Request as AuthRequest } from 'express-jwt';
import { protectedRoute, adminRoute } from '../utils/middlewares.js';
import BookController from '../controllers/books.js';
import { Book } from '../models/book.js';

// The router will be added as a middleware and will take control of requests starting with /books.
const books = Router();
export default books;

const bookController = new BookController();

books.get('/', async (req, res) => {
    const limit = parseInt(req?.query?.limit as string) || undefined;
    const skip = parseInt(req?.query?.skip as string) || undefined;
    return res.json(await bookController.getBooks(limit, skip));
});

books.get('/search', async (req, res) => {
    const query = (req?.query?.term as string) || undefined;
    const type = (req?.query?.type as string) || undefined;
    //console.log('type');

    if (!query) {
        return res.status(400).send({message: 'missing query'});
    }

    let books: Book[];
    if(type === 'fullText') {
        books = await bookController.searchBooks(query);
    }
    else if(type === 'vector') {
        books = await bookController.vectorSearchBooks(query);
    }
    return res.json(books);
});

books.post('/', protectedRoute, adminRoute, async (req: AuthRequest, res) => {
    const book = req?.body;

    if (!book || Object.keys(book).length === 0) {
        return res.status(400).send({message: bookController.errors.DETAILS_MISSING});
    }

    try {
        const result = await bookController.createBook(req?.body);
        return res.status(201).send({ result, message: bookController.success.CREATED });
    } catch (error) {
        return res.status(500).send({message: error});
    }
});

books.get('/:bookId', async (req, res) => {
    const bookId = req?.params?.bookId;

    if (!bookId) {
        return res.status(400).send({message: bookController.errors.BOOK_ID_MISSING});
    }

    const book = await bookController.getBook(bookId);
    const similar = await bookController.getSimilar(book);

    if (!book){
        return res.status(404).send({message: bookController.errors.NOT_FOUND});
    }

    book.similar = similar;
    return res.json(book);
});

books.put('/:bookId', protectedRoute, adminRoute, async (req: AuthRequest, res) => {
    const bookId = req?.params?.bookId;
    const book = req?.body;

    if (!bookId) {
        return res.status(400).send({message: bookController.errors.BOOK_ID_MISSING});
    }

    if (!book || Object.keys(book).length === 0) {
        return res.status(400).send({message: bookController.errors.DETAILS_MISSING});
    }

    try {
        const result = await collections?.books?.updateOne({ _id: bookId }, { $set: book });
        return res.status(200).send({result, message: bookController.success.UPDATED});
    } catch(error) {
        return res.status(500).send({message: error});
    }
});

books.delete('/:bookId', protectedRoute, adminRoute, async (req: AuthRequest, res) => {
    const bookId = req?.params?.bookId;

    if (!bookId) {
        return res.status(400).send({message: bookController.errors.BOOK_ID_MISSING});
    }

    try {
        const result = await collections?.books?.deleteOne({ _id: bookId });
        return res.status(202).send({result, message: bookController.success.DELETED});
    } catch (error) {
        if (error === bookController.errors.NOT_FOUND) return res.status(404).send({ message: error });
        return res.status(500).send({message: error});
    }
});
