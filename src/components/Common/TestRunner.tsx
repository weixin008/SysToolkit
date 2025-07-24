import React, { useState } from 'react';
import { TestUtils, TestSuite } from '../../utils/testUtils';
import { useNotification } from '../../context/NotificationContext';

interface TestRunnerProps {
  onClose: () => void;
}

const TestRunner: React.FC<TestRunnerProps> = ({ onClose }) => {
  const [testSuites, setTestSuites] = useState<TestSuite[]>([]);
  const [running, setRunning] = useState<boolean>(false);
  const [expandedSuites, setExpandedSuites] = useState<Set<string>>(new Set());
  const { showNotification } = useNotification();

  const runTests = async () => {
    setRunning(true);
    setTestSuites([]);
    
    try {
      const results = await TestUtils.runAllTests();
      setTestSuites(results);
      
      // 计算总体成功率
      const totalTests = results.reduce((sum, suite) => sum + suite.tests.length, 0);
      const passedTests = results.reduce((sum, suite) => 
        sum + suite.tests.filter(test => test.success).length, 0);
      
      const successRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;
      
      if (successRate === 100) {
        showNotification('success', '所有测试通过！', 3000);
      } else {
        showNotification('warning', `测试完成，通过率: ${successRate.toFixed(1)}%`, 3000);
      }
    } catch (error) {
      console.error('运行测试失败:', error);
      showNotification('error', `运行测试失败: ${error}`, 5000);
    } finally {
      setRunning(false);
    }
  };

  const toggleSuiteExpand = (suiteName: string) => {
    const newExpanded = new Set(expandedSuites);
    if (newExpanded.has(suiteName)) {
      newExpanded.delete(suiteName);
    } else {
      newExpanded.add(suiteName);
    }
    setExpandedSuites(newExpanded);
  };

  const getOverallStatus = (): { success: number, failed: number, total: number } => {
    let success = 0;
    let failed = 0;
    
    testSuites.forEach(suite => {
      suite.tests.forEach(test => {
        if (test.success) {
          success++;
        } else {
          failed++;
        }
      });
    });
    
    return {
      success,
      failed,
      total: success + failed
    };
  };

  const status = getOverallStatus();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">功能测试</h2>
            <button 
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              onClick={onClose}
            >
              ✕
            </button>
          </div>
          
          <div className="mb-6">
            <button 
              className="btn btn-primary w-full"
              onClick={runTests}
              disabled={running}
            >
              {running ? '测试运行中...' : '运行所有测试'}
            </button>
          </div>
          
          {testSuites.length > 0 && (
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">测试结果</h3>
                <div className="text-sm">
                  <span className="text-green-500 font-medium">{status.success} 通过</span>
                  <span className="mx-2">|</span>
                  <span className="text-red-500 font-medium">{status.failed} 失败</span>
                  <span className="mx-2">|</span>
                  <span>{status.total} 总计</span>
                </div>
              </div>
              
              <div className="space-y-4">
                {testSuites.map((suite, index) => (
                  <div 
                    key={index} 
                    className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
                  >
                    <div 
                      className={`flex justify-between items-center p-4 cursor-pointer ${
                        suite.success ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'
                      }`}
                      onClick={() => toggleSuiteExpand(suite.name)}
                    >
                      <div className="flex items-center">
                        <span className={`mr-2 ${suite.success ? 'text-green-500' : 'text-red-500'}`}>
                          {suite.success ? '✓' : '✗'}
                        </span>
                        <h4 className="font-medium">{suite.name}</h4>
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm text-gray-500 dark:text-gray-400 mr-4">
                          {suite.duration.toFixed(0)}ms
                        </span>
                        <span>{expandedSuites.has(suite.name) ? '▲' : '▼'}</span>
                      </div>
                    </div>
                    
                    {expandedSuites.has(suite.name) && (
                      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                        <table className="w-full">
                          <thead>
                            <tr className="text-left text-sm text-gray-500 dark:text-gray-400">
                              <th className="pb-2">测试</th>
                              <th className="pb-2">状态</th>
                              <th className="pb-2">耗时</th>
                              <th className="pb-2">消息</th>
                            </tr>
                          </thead>
                          <tbody>
                            {suite.tests.map((test, testIndex) => (
                              <tr key={testIndex} className="border-t border-gray-100 dark:border-gray-800">
                                <td className="py-2">{test.name}</td>
                                <td className="py-2">
                                  <span className={test.success ? 'text-green-500' : 'text-red-500'}>
                                    {test.success ? '通过' : '失败'}
                                  </span>
                                </td>
                                <td className="py-2 text-sm text-gray-500 dark:text-gray-400">
                                  {test.duration.toFixed(0)}ms
                                </td>
                                <td className="py-2 text-sm">
                                  {test.message}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="mt-6 text-center">
            <button 
              className="btn btn-secondary"
              onClick={onClose}
            >
              关闭
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestRunner;