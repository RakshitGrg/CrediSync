import React from 'react'

const AdminProfile = ({expanded}) => {
  return (
    <div className={`min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4 sm:p-6 lg:p-8 ${expanded ? 'ml-[18%]' : 'ml-24'} transition-all`}>
      AdminProfile
    </div>
  )
}

export default AdminProfile
