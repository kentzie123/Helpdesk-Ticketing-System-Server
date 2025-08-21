const ArticleViews = require('../models/articleViews');
const Article = require('../models/knowledgeBase'); 


// Log a view if not already viewed
const createArticleView = async (req, res) => {
    const { articleId } = req.body;
    const { userID } = req.user;
    try {
        const alreadyViewed = await ArticleViews.findOne({
            userId: userID,
            articleId: articleId           
        });

        if (!alreadyViewed) {
            // 1. Create the view record
            await ArticleViews.create({
                userId: userID,
                articleId: articleId,
                viewedAt: new Date()
            });

            // 2. Increment the article's views count
            await Article.findByIdAndUpdate(articleId, {
                $inc: { views: 1 }
            });

            return res.status(201).json({ message: "View recorded" });
        } else {
            return res.status(200).json({ message: "Already viewed" });
        }
    } catch (err) {
        console.error("Error creating article view:", err);
        return res.status(500).json({ error: "Server error" });
    }
};

// Check if a user already viewed a specific article
// const checkAlreadyViewed = async (req, res) => {
//     const { userID, _id } = req.params;

//     try {
//         const alreadyViewed = await ArticleViews.findOne({
//             articleId: _id,
//             userId: userID
//         });

//         if (alreadyViewed) {
//             return res.status(200).json({ viewed: true });
//         } else {
//             return res.status(200).json({ viewed: false });
//         }
//     } catch (err) {
//         console.error("Error checking article view:", err);
//         return res.status(500).json({ message: "Server error" });
//     }
// };


module.exports = {
    createArticleView
};
