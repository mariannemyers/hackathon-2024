import { OpenAIClient, AzureKeyCredential } from '@azure/openai';

const { EMBEDDING_KEY } = process.env;
const { AZURE_ENDPOINT } = process.env;

const getTermEmbeddings = async (text) => {
    
    const openai = new OpenAIClient(AZURE_ENDPOINT, new AzureKeyCredential(EMBEDDING_KEY));
    const embeddings = await openai.getEmbeddings(
        'public-sector-sa-oai-text-embedding-ada-002',
        text
    );

    console.log(embeddings);
    return embeddings?.data[0]?.embedding;
};

export default getTermEmbeddings;