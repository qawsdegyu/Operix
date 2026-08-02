const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const aiRoutes = require('./routes/ai.routes');
const errorHandler = require('./middlewares/error.middleware');

const app = express();

// Security middlewares (CSP disabled so it doesn't block your frontend CDNs like Tailwind/Lucide)
app.use(helmet({
  contentSecurityPolicy: false,
}));
app.use(cors({ origin: '*', methods: ['GET', 'POST', 'DELETE', 'OPTIONS'] }));
app.use(express.json());

// Serve static frontend files (index.html, admin.html, css, js)
app.use(express.static(path.join(__dirname, '../')));

// Routes
app.use('/api/ai', aiRoutes);

// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Operix RAG Engine running securely on port ${PORT}`);
  console.log(`🌍 Frontend available at: http://localhost:${PORT}`);
});
