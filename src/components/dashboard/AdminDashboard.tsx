import React from 'react';
import { motion } from 'framer-motion';
import { AdminWelcomeCard } from './AdminWelcomeCard';
import { TeamOverviewWidget } from './TeamOverviewWidget';
import { AttendanceOverviewWidget } from './AttendanceOverviewWidget';
import { LeaveRequestsWidget } from './LeaveRequestsWidget';
// import { PayrollSummaryWidget } from './PayrollSummaryWidget';
import { RecentActivitiesWidget } from './RecentActivitiesWidget';
import { CompanyAnnouncementsWidget } from './CompanyAnnouncementsWidget';

export function AdminDashboard() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100 }
    }
  };

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants}>
        <AdminWelcomeCard />
      </motion.div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <TeamOverviewWidget />
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <LeaveRequestsWidget />
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <AttendanceOverviewWidget />
        </motion.div>
        
        {/* <motion.div variants={itemVariants}>
          <PayrollSummaryWidget />
        </motion.div> */}
        
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <CompanyAnnouncementsWidget />
        </motion.div>
        
        <motion.div variants={itemVariants} className="md:col-span-2 lg:col-span-3">
          <RecentActivitiesWidget />
        </motion.div>
      </div>
    </motion.div>
  );
}
