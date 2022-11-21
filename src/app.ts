import expresss,{Request,Response} from 'express';
import logger from 'morgan';
import cookieParser from 'cookie-parser';
import userRouter from './routes/users'
import indexRouter from './routes/index'
import {db} from './config'
import adminRouter from './routes/admin'
import vendorsRoute from './routes/vendor'


//sequelize connection
db.sync().then(()=>{
    console.log('DB connected succesfully')
}).catch( err=>{
    console.log(err)
})

const app = expresss()

app.use(expresss.json())
app.use(logger('dev'))
app.use(cookieParser())

//Router middleware
app.use('/', indexRouter)
app.use('/users', userRouter)
app.use('/admins', adminRouter)
app.use("/vendors", vendorsRouter)

// app.get('/about', (req:Request,res:Response)=>{
//     res.status(200).json({
//         message: "Success"
//     })
// })

const port = 4000
app.listen(port, ()=>{
    console.log(`server is running at port ${port}`)
})

export default app;