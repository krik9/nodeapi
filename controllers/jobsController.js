
//Get all jobs => /api/v1/jobs
exports.getJobs = (req,res,next) =>{
    res.status(200).json({
        success:true,
        middlewareuser: req.user,
        requestMethod: req.requestMethod,
        requesturl:req.urlpath,
        message:"This route will display all jobs in future."
    });
}