const Article = require("../models/knowledgeBase");
const ArticleRatings = require("../models/articleRating");

const createArticleRating = async (req, res) => {
  const { articleId, rating } = req.body;
  const { userID } = req.user;
  console.log(`Rating articleId: ${articleId} with ${rating} star/s`);
  

  if (!userID || !articleId || !rating) {
    return res
      .status(400)
      .json({ message: "User ID, Article ID, and Rating are required" });
  }

  if (rating < 1 || rating > 5) {
    return res.status(400).json({ message: "Rating must be between 1 and 5" });
  }

  try {
    const article = await Article.findById(articleId);
    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    const existingRating = await ArticleRatings.findOne({ userID, articleId });

    if (!existingRating) {
      // Create a new rating
      const newRating = new ArticleRatings({
        userID,
        articleId,
        rating,
      });
      await newRating.save();

      // Update article rating summary
      const totalRating =
        article.ratings.average * article.ratings.count + rating;
      const newCount = article.ratings.count + 1;
      const newAverage = totalRating / newCount;

      article.ratings.average = newAverage;
      article.ratings.count = newCount;
      await article.save();
    } else {
      // Update existing rating
      const oldRating = existingRating.rating;
      existingRating.rating = rating;
      await existingRating.save();

      // Recalculate average
      const totalRating =
        article.ratings.average * article.ratings.count - oldRating + rating;
      const newAverage = totalRating / article.ratings.count;

      article.ratings.average = newAverage;
      await article.save();
    }

    return res.status(200).json({ message: "Rating submitted successfully" });
  } catch (err) {
    console.error("Error creating article rating:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

const getUserArticleRating = async (req, res) => {
  const { articleId } = req.params;
  const { userID } = req.user;

  try {
    const rating = await ArticleRatings.findOne({ articleId, userID });

    if (!rating) {
      return res.status(200).json(0);
    }

    return res.status(200).json(rating.rating);
  } catch (err) {
    console.error("Error fetching user rating:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createArticleRating,
  getUserArticleRating,
};
