const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const aiRoutes = require('./routes/ai.routes');
const errorHandler = require('./middlewares/error.middleware');

const app = express();

// Security middlewares
app.use(helmet());
app.use(cors({ origin: '*', methods: ['GET', 'POST', 'DELETE', 'OPTIONS'] }));
app.use(express.json());

// Routes
app.use('/api/ai', aiRoutes);

// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Operix RAG Engine running securely on port ${PORT}`);
});
