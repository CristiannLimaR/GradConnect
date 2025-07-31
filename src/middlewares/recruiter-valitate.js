export const isRecruiter = (req,res,next) => {
    if(req.user.role !== 'RECRUITER') {
        return res.status(403).json({
            success: false,
            msg: "Only recurites can create or update work offers"
        });
    }
    next()
}