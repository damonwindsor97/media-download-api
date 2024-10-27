module.exports = {

    async testCallback(req, res, next){
        res.send('Image endpoint hit')
    },


    async convertImage(req, res, next){
        const file = req.body.image;

        try {
            
        } catch (error) {
            
        }
    }

}