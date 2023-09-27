exports.deleteOne = model => async (req, res) => {

    await model.findByIdAndDelete({ _id: req.params.id }).then(() => {
        res.status(400).json({
            data: null
        })
    })
}