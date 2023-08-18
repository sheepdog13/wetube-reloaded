import Video from "../models/Video";

/*
callback방식
console.log("start")
Video.find({}, (error, videos) => {
    if(error){
        return res.render("server-error")
    }
    return res.render("home", {pageTitle: "Home", videos})
});
console.log("finished")
start -> finished -> render
*/
export const home = async (req, res) => {
    const videos = await Video.find({}).sort({createdAt: "desc"});
    return res.render("home", {pageTitle: "Home", videos})
};
export const watch = async (req, res) => {
    const { id } = req.params;
    const video = await Video.findById(id);
    // error를 먼저처리하는게 편하다
    if(!video){
        // return을 설정해 다음 작동이 실행되지 않게 해야한다
        return res.status(404).render("404", {pageTitle: "Video not found"});
    }
    return res.render("watch", {pageTitle: video.title, video});
};

export const getEdit = async (req, res) => {
    const { id } = req.params;
    const video = await Video.findById(id);
    if(!video){
        return res.status(404).render("404", {pageTitle: "Video not found"});
    }
    res.render("edit", {pageTitle: `Edit ${video.title}`, video})
};
export const postEdit = async (req, res) => {
    const { id } = req.params;
    const { title, description, hashtags } = req.body
    // const video = await Video.findById(id);
    // exists(): video전체를 받아오는게 아니라 boolean을 가져온다
    const video = await Video.exists({ _id: id });
    if(!video){
        return res.render("404", {pageTitle: "Video not found"});
    }
    await Video.findByIdAndUpdate(id, {
        title,
        description,
        hashtags: Video.formatHashtags(hashtags),
    })
    return res.redirect(`/videos/${id}`);
}
export const getUpload = (req, res) => {
    return res.render("upload", {pageTitle: "Upload Video"})
};

export const postUpload = async (req, res) => {
    // here we will add a video to the videos array.
    const { title, description, hashtags } = req.body
    try {
        await Video.create({
            title,
            description,
            hashtags: Video.formatHashtags(hashtags),
        });
        return res.redirect("/");
    } catch(error){
        return res.status(400).render("upload", {
            pageTitle: "Upload Video",
            errorMessage: error._message,
        });
    }
};

export const deleteVideo = async (req, res) => {
    const { id } = req.params;
    await Video.findByIdAndDelete(id);
    return res.redirect("/");
}

export const search = async (req, res) => {
    const { keyword } = req.query;
    // 검색을 안했을때 undefined를 막기위한 설정
    let videos = [];
    if(keyword) {
        const videos = await Video.find({
            title : {
                // 정규식을 mongodb에서 쓰는 방법 i는 소문자 대문자 구별을 없애준다
                $regex: new RegExp(`${keyword}`, "i")
            },
        });
    }
    return res.render("search", { pageTitle: "Search", videos})
}

