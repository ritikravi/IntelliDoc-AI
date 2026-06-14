import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Clock, 
  User, 
  FileText, 
  Download,
  Filter,
  Activity
} from 'lucide-react';

const actionColors = {
  created: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  updated: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  deleted: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  approved: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  rejected: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  viewed: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  exported: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
};

const actionIcons = {
  created: '+',
  updated: '✎',
  deleted: '×',
  approved: '✓',
  rejected: '✕',
  viewed: '👁',
  exported: '↓',
};

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAuditLogs();
    fetchAuditStats();
  }, [filter]);

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const url = filter === 'all' 
        ? '/api/v1/audit/logs'
        : `/api/v1/audit/logs?action=${filter}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setLogs(data.logs);
      }
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAuditStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/v1/audit/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching audit stats:', error);
    }
  };

  const exportLogs = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/v1/audit/export', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'audit-logs.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (error) {
      console.error('Error exporting logs:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Shield className="w-8 h-8 text-primary" />
            Audit Logs
          </h1>
          <p className="text-muted-foreground mt-1">
            Track all document activities and changes
          </p>
        </div>
        <button
          onClick={exportLogs}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-xl border border-border p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Actions</p>
                <p className="text-3xl font-bold mt-1">
                  {stats.byAction?.reduce((sum, a) => sum + a.count, 0) || 0}
                </p>
              </div>
              <Activity className="w-12 h-12 text-primary opacity-20" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card rounded-xl border border-border p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Today</p>
                <p className="text-3xl font-bold mt-1">
                  {stats.byDay?.[0]?.count || 0}
                </p>
              </div>
              <Clock className="w-12 h-12 text-blue-500 opacity-20" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card rounded-xl border border-border p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Most Common</p>
                <p className="text-xl font-bold mt-1">
                  {stats.byAction?.[0]?._id || 'N/A'}
                </p>
              </div>
              <FileText className="w-12 h-12 text-purple-500 opacity-20" />
            </div>
          </motion.div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {['all', 'created', 'updated', 'deleted', 'approved', 'viewed', 'exported'].map((action) => (
          <button
            key={action}
            onClick={() => setFilter(action)}
            className={`px-4 py-2 rounded-lg border transition-colors whitespace-nowrap ${
              filter === action
                ? 'bg-primary text-primary-foreground border-primary'
                : 'border-border hover:bg-accent'
            }`}
          >
            {action.charAt(0).toUpperCase() + action.slice(1)}
          </button>
        ))}
      </div>

      {/* Audit Log Timeline */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
            <p className="text-muted-foreground mt-4">Loading audit logs...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-12">
            <Shield className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No audit logs found</h3>
            <p className="text-muted-foreground">
              Activity will be tracked here as you work with documents
            </p>
          </div>
        ) : (
          logs.map((log, index) => (
            <motion.div
              key={log._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-card rounded-xl border border-border p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${
                  actionColors[log.action] || actionColors.viewed
                }`}>
                  {actionIcons[log.action] || '•'}
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">
                        {log.action.charAt(0).toUpperCase() + log.action.slice(1)} Action
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        <User className="w-3 h-3 inline mr-1" />
                        {log.actionBy?.name || 'System'} • {formatDate(log.createdAt)}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      actionColors[log.action] || actionColors.viewed
                    }`}>
                      {log.action}
                    </span>
                  </div>

                  {log.document && (
                    <div className="mt-3 p-3 bg-accent rounded-lg">
                      <p className="text-sm">
                        <FileText className="w-4 h-4 inline mr-2" />
                        <span className="font-medium">Document:</span> {log.document.fileName}
                        {log.document.invoiceNumber && (
                          <span className="ml-2 text-muted-foreground">
                            ({log.document.invoiceNumber})
                          </span>
                        )}
                      </p>
                    </div>
                  )}

                  {log.ipAddress && (
                    <p className="text-xs text-muted-foreground mt-2">
                      IP: {log.ipAddress}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
