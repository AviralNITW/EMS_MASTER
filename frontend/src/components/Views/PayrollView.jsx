import React, { useState, useEffect } from 'react';
import { DollarSign, Download, Check, Clock, FileText, Plus } from 'lucide-react';
import DataGrid from '../UI/DataGrid';
import SkeletonLoader from '../UI/SkeletonLoader';
import { toast } from 'react-toastify';
import { payrollAPI } from '../../services/api';

const PayrollView = ({ users, role }) => {
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const fetchPayrolls = async () => {
    try {
      setLoading(true);
      const data = await payrollAPI.getAll();
      setPayrolls(data);
    } catch (error) {
      toast.error('Failed to load payrolls');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayrolls();
  }, []);

  const generatePayrolls = async () => {
    try {
      setLoading(true);
      const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
      let generated = 0;
      
      for (const u of users) {
        // Skip if already has payroll for this month
        if (payrolls.some(p => p.employee?._id === u._id && p.month === currentMonth)) continue;
        
        const base = u.role === 'Admin' ? 10000 : u.role === 'Manager' ? 8000 : u.role === 'HR' ? 7000 : 5000;
        await payrollAPI.create({
          employee: u._id,
          basicSalary: base,
          allowances: base * 0.1,
          deductions: base * 0.05,
          netSalary: base + (base * 0.1) - (base * 0.05),
          status: 'Pending',
          month: currentMonth
        });
        generated++;
      }
      
      if (generated > 0) {
        toast.success(`Generated ${generated} payroll records!`);
        fetchPayrolls();
      } else {
        toast.info('Payrolls already generated for this month.');
        setLoading(false);
      }
    } catch (error) {
      toast.error('Failed to generate payrolls');
      setLoading(false);
    }
  };

  const handlePayrollAction = async (id, action) => {
    try {
      let newStatus = '';
      if (action === 'REQUEST_VERIFICATION') newStatus = 'Pending_Verification';
      if (action === 'VERIFY') newStatus = 'Verified';
      if (action === 'PAY') newStatus = 'Paid';

      await payrollAPI.updateStatus(id, newStatus);
      
      setPayrolls(payrolls.map(p => p._id === id ? { ...p, status: newStatus } : p));
      
      if (action === 'REQUEST_VERIFICATION') toast.info('Verification requested from Admin');
      else if (action === 'VERIFY') toast.success('Payroll verified');
      else if (action === 'PAY') toast.success('Payment processed successfully');
    } catch (error) {
      toast.error('Failed to update payroll status');
    }
  };

  const columns = [
    {
      header: 'Employee',
      accessor: 'employee',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center font-bold text-xs shrink-0">
            {row.employee.firstName?.charAt(0)}{row.employee.lastName?.charAt(0)}
          </div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-white">{row.employee.firstName} {row.employee.lastName}</p>
            <p className="text-[10px] text-gray-500 dark:text-gray-400">{row.employee.role}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Basic Salary',
      accessor: 'basicSalary',
      render: (row) => <span className="text-gray-700 dark:text-gray-300 font-medium">${row.basicSalary.toLocaleString()}</span>
    },
    {
      header: 'Net Salary',
      accessor: 'netSalary',
      render: (row) => <span className="text-emerald-400 font-bold">${row.netSalary.toLocaleString()}</span>
    },
    {
      header: 'Status',
      render: (row) => {
        let colors = 'bg-gray-500/10 text-gray-500 border-gray-500/20';
        if (row.status === 'Paid') colors = 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
        else if (row.status === 'Verified') colors = 'bg-blue-500/10 text-blue-500 border-blue-500/20';
        else if (row.status === 'Pending_Verification') colors = 'bg-purple-500/10 text-purple-500 border-purple-500/20';
        else if (row.status === 'Pending') colors = 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
        
        return (
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${colors}`}>
            {row.status.replace('_', ' ')}
          </span>
        );
      }
    }
  ];

  if (role === 'Admin' || role === 'HR') {
    columns.push({
      header: 'Action',
      accessor: 'actions',
      render: (row) => {
        if (role === 'HR') {
          return (
            <div className="flex items-center gap-2">
              {row.status === 'Pending' && (
                <button 
                  onClick={(e) => { e.stopPropagation(); handlePayrollAction(row._id, 'REQUEST_VERIFICATION'); }}
                  className="px-3 py-1.5 bg-yellow-500/20 hover:bg-yellow-500/40 text-yellow-500 rounded-lg transition-colors text-xs font-semibold flex items-center gap-1"
                >
                  <Clock size={12} /> Request Ver.
                </button>
              )}
              {row.status === 'Pending_Verification' && (
                <span className="text-xs text-gray-500 dark:text-gray-400 italic">Awaiting Admin</span>
              )}
              {row.status === 'Verified' && (
                <button 
                  onClick={(e) => { e.stopPropagation(); handlePayrollAction(row._id, 'PAY'); }}
                  className="px-3 py-1.5 bg-primary/20 hover:bg-primary/40 text-primary rounded-lg transition-colors text-xs font-semibold flex items-center gap-1"
                >
                  <DollarSign size={12} /> Process Payment
                </button>
              )}
              {row.status === 'Paid' && (
                <button className="p-1.5 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg transition-colors" title="Download Payslip">
                  <Download size={14} />
                </button>
              )}
            </div>
          );
        } else if (role === 'Admin') {
          return (
            <div className="flex items-center gap-2">
              {row.status === 'Pending_Verification' && (
                <button 
                  onClick={(e) => { e.stopPropagation(); handlePayrollAction(row._id, 'VERIFY'); }}
                  className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-500 rounded-lg transition-colors text-xs font-semibold flex items-center gap-1"
                >
                  <Check size={12} /> Verify Payroll
                </button>
              )}
              {(row.status === 'Pending' || row.status === 'Verified') && (
                <span className="text-xs text-gray-500 italic">No Action Needed</span>
              )}
              {row.status === 'Paid' && (
                <span className="text-xs text-emerald-500 font-bold">Paid</span>
              )}
            </div>
          );
        }
      }
    });
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Payroll Management</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Review salaries and process payments for the current month.</p>
        </div>
        
        {(role === 'Admin' || role === 'HR') && (
          <div className="flex gap-3">
            <button 
              onClick={generatePayrolls}
              disabled={loading}
              className="flex items-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/20 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
            >
              <Plus size={16} /> Generate Payrolls
            </button>
            <button 
              className="flex items-center gap-2 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors"
            >
              <FileText size={16} /> Export Payroll
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 bg-white dark:bg-[#111827] rounded-2xl border border-gray-200 dark:border-white/5 p-6 shadow-2xl flex flex-col">
        {loading ? (
          <SkeletonLoader type="table" count={5} />
        ) : (
          <DataGrid 
            columns={columns} 
            data={payrolls} 
          />
        )}
      </div>
    </div>
  );
};

export default PayrollView;
