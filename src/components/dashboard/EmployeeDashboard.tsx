import React from 'react';
import { motion } from 'framer-motion';
import { WelcomeCard } from './WelcomeCard';
import { AttendanceWidget } from './AttendanceWidget';
import { LeaveWidget } from './LeaveWidget';
import { PayrollWidget } from './PayrollWidget';
import { WalletWidget } from './WalletWidget';
import { DocumentsWidget } from './DocumentsWidget';
import { PerformanceWidget } from './PerformanceWidget';
import { RecentActivityWidget } from './RecentActivityWidget';
import { PendingActionsSection } from './PendingActionsSection';

export function EmployeeDashboard() {
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
        <WelcomeCard />
      </motion.div>

      {/* Pending Actions Section for employees */}
      <motion.div variants={itemVariants}>
        <PendingActionsSection />
      </motion.div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <AttendanceWidget />
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <LeaveWidget />
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <PayrollWidget />
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <WalletWidget />
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <DocumentsWidget />
        </motion.div>
        
        <motion.div variants={itemVariants} className="md:col-span-2 lg:col-span-3">
          <RecentActivityWidget />
        </motion.div>
      </div>
    </motion.div>
  );
}