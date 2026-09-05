import 'dotenv/config';
import app from './app.js';
import { initEmbeddingModel } from './services/embedding.service.js';

const PORT = process.env.PORT || 3000;

const startServer = async () => {
    try {
        console.log('Initializing embedding model...');
        await initEmbeddingModel();
        
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();
