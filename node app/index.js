import express from 'express'

const app = express();

app.use('/',(req,res)=>{
  res.status(200).json({
    success:true,
    message:"app running"
  })
})
const port = 6000;
app.listen(port,()=>{
    console.log(`server running on ${port}`)
})