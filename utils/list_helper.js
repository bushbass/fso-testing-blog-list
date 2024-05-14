const dummy = (blogs) => {
    return 1
}

const totalLikes = (blogs) => {
    return blogs.reduce((sum, item) => {
        return sum + item.likes
    }, 0)
}


const favoriteBlog = (blogs) => {
    let count = 0
    let most = {}
    blogs.forEach(item => {
        if (item.likes > count) {
            most = item; count = item.likes
            console.log(most)
        }
    })
    return most
}

module.exports = {
    dummy, totalLikes, favoriteBlog
}