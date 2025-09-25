class apiError extends Error{
    constructor(
        statusCode,
        message="Something went wrong",
        stack="",
        errors=[]
    ){
        super(message)
        this.message= message
        this.errors = errors
        this.statusCode= statusCode
        this.success = false
        this.data = null

        if(stack){
            this.stack= stack;
        }
        else{
            Error.captureStackTrace(this,this.constructor)
        }
    }
}

export  {apiError}