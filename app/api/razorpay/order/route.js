import {NextResponse} from 'next/server'

export async function POST(req){
    const { amount } = await req.json()

    const Razorpay = require("razorpay")
    const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
    })

    const options = {
        amount,
        currency:"INR",
        receipt:"receipt_" + Date.now(),
    }

    const order = await razorpay.orders.create(options);
    return NextResponse.json(order)
}