'use client';

import {useState, useEffect} from 'react';
import Link from 'next/link'
//import Image from 'next/image'
import Slider from 'react-slick';
import CourseCard from '../../components/CourseCard';
import { courses } from '../../lib/courses';
import './dashboard.css';

export default function DashboardPage() {

  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(()=>{

    //fetch username from local storage
    const storedUser = JSON.parse(localStorage.getItem('mockUser'))
    if (storedUser && storedUser.name){
      setUsername(storedUser.name)
    }
    setLoading(false);
  }, []);

  //carousel settings
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    responsive:[
      {
        breakpoint:1024,
        settings:{
          slidesToShow:2,
          slidesToScroll: 1,
        }
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow:1,
          slideToScroll:1,
        }
      }
    ]
  }

  //Mock data for recent activity
  const recentActivity = [
    { id:1, type: 'test', title: 'SSC CGL Mock Test 1', score: '75%', date: '29-04-2025'},
    {id:2, type:'test', title: 'JEE', progress:'60%', date:'23-04-2025'}
  ]

if(loading){
  return <div className="min-h-screen flex items-center justify-center">
Loading...
  </div>
}
  return (
    <div className='bg-gray-50 min-h-screen pb-12'>
      {/*welcome banner*/}
      <div className='bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-8'>
        <div className='container mx-auto px-6'>
          <h1 className='text-3xl font-bold'>Welcome back, {username || 'Student'}!</h1>
          <p className='mt-2'>Continue your preparation journey</p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Stats cards*/}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            {label: 'Tests Taken',value: '12'},
            {label: "Avg. Score", value:' 72%'},
            {label:' Study Hours', value: '45h'},
            {label: 'Rank', value: '#222'},
            ].map((stat, index) =>(
              <div key={index} className='bg-white rounded-xl shadow-md p-4 flex items-center'>
                  <p className='text-2xl font-bold text-blue-700'>{stat.value}</p>
                  <p className='text-sm text-gray-600'>{stat.label}</p>
              </div>
            ))}
        </div>

      {/** Trending course carousel */}
      <div className="mb-10">
          <h2 className="text-2xl font-bold mb-6">Trending Courses</h2>
          <div className="slick-container">
            <Slider {...sliderSettings}>
              {courses.map((course) => (
                <div key={course.id} className="px-2">
                  <CourseCard
                    id={course.id}
                    title={course.title}
                    description={course.description}
                    image={course.image}
                  />
                </div>
              ))}
            </Slider>
          </div>
        </div>

          {/*Main content Grid */}
    <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
      {/**Recent acitivty - 2/3 width on large screens */}
      <div className='lg:col-span-2 space-y-6'>
        <div className='bg-white rounded-xl shadow-md p-6'>
          <div className='flex justify-between items-center mb-4'>
            <h2 className='text-xl font-semibold'>Recent Activity</h2>
            <Link href="/activity" className='text-blue-600 hover:underline text-sm'>
            View All
            </Link>
          </div>

         {recentActivity.length > 0 ? (
          <div className='space-y-4'>
            {recentActivity.map((item) => (
          <div key={item.id} className='border-b pb-4 last:border-b-0 last:pd-0'>
            <div className='flex justify-between items-start'>
              <div>
                <h3 className='font-medium'>{item.title}</h3>
                <p className='text-sm text-gray-500'>{item.date}</p>
              </div>
              {item.type === 'test' ? (
                <span className='px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs'>
                  Score: {item.score}
                </span>
              ) : (
                <span className='px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs'>Progress: {item.progress}</span>
              )}
            </div>
            </div>
            ))}
          </div>
        ) : (
          <p className='text-gray-500 text-center py-4' >No recent activity found.</p>
        )}
        </div>
        </div>

        {/**Sidebar - 1/3 width on large screens */}
        <div className='space-y-6'>
          {/** study Planner */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">
              Today's Study Plan
            </h2>
            <div className="space-y-4">
              {[
                {title: 'JEE', time: '10AM', duration: ' 1 hour', completed: true},
                { title: 'English Grammar', time: '2:00 PM', duration: '45 mins', completed: false },
                { title: 'General Knowledge', time: '4:30 PM', duration: '30 mins', completed: false },
              ].map((task, index) => (
                <div key={index} className="flex items-center">
                <input
                  type="checkbox"
                  checked={task.completed}
                  readOnly
                  className="mr-3 h-5 w-5 text-blue-600"
                />
                <div className="flex-1">
                      <p className={`font-medium ${task.completed ? 'line-through text-gray-400' : ''}`}>
                        {task.title}
                      </p>
                      <p className="text-sm text-gray-500">
                        {task.time} • {task.duration}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <button className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                View Full Schedule
              </button>
          </div>

          {/* Quick Links */}
          <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Quick Links</h2>
              <div className="space-y-2">
                {[
                  { name: 'All Courses', href: '/courses' },
                  { name: 'My Bookmarks', href: '/bookmarks'},
                  { name: 'Performance Reports', href: '/reports'},
                  { name: 'Study Materials', href: '/materials'},
                ].map((link, index) => (
                  <Link
                    key={index}
                    href={link.href}
                    className="flex items-center p-3 border rounded-lg hover:bg-gray-50 transition"
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>
        </div>
      </div>
    </div>
    </div>
    )}
