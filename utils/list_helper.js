const dummy = (blogs) => {
    return 1
}

//total likes in all the blog posts
const totalLikes = (blogs) => {
    return blogs.reduce((sum, item) => {
        return sum + item.likes
    }, 0)
}

// single blog with the most likes
const favoriteBlog = (blogs) => {
    let count = 0
    let most = {}
    blogs.forEach(item => {
        if (item.likes > count) {
            most = item; count = item.likes
        }
    })
    return most
}

// author that has the most blogsand how many
const mostBlogs = (blogs) => {
    let authors = {}
    blogs.forEach(blog => {
        let author = blog.author
        authors[author] ? authors[author]++ : authors[author] = 1
    })
    function mostBlogs(authors) {
        let highestValue = -Infinity;
        let highestEntry = null;

        for (const [key, value] of Object.entries(authors)) {
            if (value > highestValue) {
                highestValue = value;
                highestEntry = { author: key, blogs: value };
            }
        }

        return highestEntry;
    }
    return mostBlogs(authors)
}

// author with the most total likes and how many
const mostLikes = (blogs) => {
    let authors = {}
    blogs.forEach(blog => {
        let author = blog.author
        let likes = blog.likes

        authors[author] ? authors[author] += likes : authors[author] = likes

    })
    function getMostLikedEntry(authors) {
        let mostLikes = -Infinity;
        let mostLikedName = null;

        for (const [name, likes] of Object.entries(authors)) {
            if (likes > mostLikes) {
                mostLikes = likes;
                mostLikedName = name;
            }
        }
        // console.log({
        //     author: mostLikedName,
        //     likes: mostLikes
        // })

        return { author: mostLikedName, likes: mostLikes };
    }

    return getMostLikedEntry(authors);
}

module.exports = {
    dummy, totalLikes, favoriteBlog, mostBlogs, mostLikes
}