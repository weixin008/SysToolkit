import { invoke } from '@tauri-apps/api/tauri';

// 测试状态接口
export interface TestResult {
  name: string;
  success: boolean;
  message: string;
  duration: number;
}

// 测试套件接口
export interface TestSuite {
  name: string;
  tests: TestResult[];
  startTime: number;
  endTime: number;
  duration: number;
  success: boolean;
}

// 测试工具类
export class TestUtils {
  // 运行所有测试
  public static async runAllTests(): Promise<TestSuite[]> {
    const suites: TestSuite[] = [];
    
    // 添加各个测试套件
    suites.push(await this.runPortMonitorTests());
    suites.push(await this.runProcessAnalyzerTests());
    suites.push(await this.runFileMonitorTests());
    suites.push(await this.runDockerTests());
    
    return suites;
  }
  
  // 端口监控测试
  private static async runPortMonitorTests(): Promise<TestSuite> {
    const suite: TestSuite = {
      name: '端口监控测试',
      tests: [],
      startTime: performance.now(),
      endTime: 0,
      duration: 0,
      success: true
    };
    
    // 测试获取所有端口
    suite.tests.push(await this.runTest('获取所有端口', async () => {
      const ports = await invoke('get_all_ports');
      if (!Array.isArray(ports)) {
        throw new Error('返回值不是数组');
      }
      return '成功获取端口列表';
    }));
    
    // 测试获取特定端口
    suite.tests.push(await this.runTest('获取特定端口', async () => {
      // 使用一个常见的端口进行测试
      await invoke('get_port_info', { port: 80 });
      return '成功获取端口信息';
    }));
    
    // 更新套件结果
    suite.endTime = performance.now();
    suite.duration = suite.endTime - suite.startTime;
    suite.success = suite.tests.every(test => test.success);
    
    return suite;
  }
  
  // 进程分析测试
  private static async runProcessAnalyzerTests(): Promise<TestSuite> {
    const suite: TestSuite = {
      name: '进程分析测试',
      tests: [],
      startTime: performance.now(),
      endTime: 0,
      duration: 0,
      success: true
    };
    
    // 测试获取所有进程
    suite.tests.push(await this.runTest('获取所有进程', async () => {
      const processes = await invoke('get_all_processes');
      if (!Array.isArray(processes)) {
        throw new Error('返回值不是数组');
      }
      return '成功获取进程列表';
    }));
    
    // 更新套件结果
    suite.endTime = performance.now();
    suite.duration = suite.endTime - suite.startTime;
    suite.success = suite.tests.every(test => test.success);
    
    return suite;
  }
  
  // 文件监控测试
  private static async runFileMonitorTests(): Promise<TestSuite> {
    const suite: TestSuite = {
      name: '文件监控测试',
      tests: [],
      startTime: performance.now(),
      endTime: 0,
      duration: 0,
      success: true
    };
    
    // 测试文件占用检测
    suite.tests.push(await this.runTest('文件占用检测', async () => {
      try {
        // 使用系统临时文件进行测试
        const tempFile = 'C:\\Windows\\System32\\drivers\\etc\\hosts';
        await invoke('check_file_occupancy', { filePath: tempFile });
        return '成功检测文件占用';
      } catch (error) {
        // 如果文件不存在，也算测试通过
        if (String(error).includes('文件不存在')) {
          return '文件不存在，但API正常工作';
        }
        throw error;
      }
    }));
    
    // 更新套件结果
    suite.endTime = performance.now();
    suite.duration = suite.endTime - suite.startTime;
    suite.success = suite.tests.every(test => test.success);
    
    return suite;
  }
  
  // Docker测试
  private static async runDockerTests(): Promise<TestSuite> {
    const suite: TestSuite = {
      name: 'Docker测试',
      tests: [],
      startTime: performance.now(),
      endTime: 0,
      duration: 0,
      success: true
    };
    
    // 测试Docker可用性
    suite.tests.push(await this.runTest('Docker可用性检测', async () => {
      const available = await invoke('is_docker_available');
      return available ? 'Docker可用' : 'Docker不可用，但API正常工作';
    }));
    
    // 如果Docker可用，测试获取容器列表
    const dockerAvailable = await invoke<boolean>('is_docker_available');
    if (dockerAvailable) {
      suite.tests.push(await this.runTest('获取Docker容器', async () => {
        const containers = await invoke('get_docker_containers');
        if (!Array.isArray(containers)) {
          throw new Error('返回值不是数组');
        }
        return '成功获取Docker容器列表';
      }));
    }
    
    // 更新套件结果
    suite.endTime = performance.now();
    suite.duration = suite.endTime - suite.startTime;
    suite.success = suite.tests.every(test => test.success);
    
    return suite;
  }
  
  // 运行单个测试
  private static async runTest(name: string, testFn: () => Promise<string>): Promise<TestResult> {
    const startTime = performance.now();
    let success = false;
    let message = '';
    
    try {
      message = await testFn();
      success = true;
    } catch (error) {
      message = `测试失败: ${error}`;
      console.error(`Test "${name}" failed:`, error);
    }
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    return {
      name,
      success,
      message,
      duration
    };
  }
}