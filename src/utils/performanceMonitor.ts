import React, { useEffect } from 'react';

// 性能监控类
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, PerformanceMetric>;
  private enabled: boolean;

  private constructor() {
    this.metrics = new Map();
    this.enabled = typeof window !== 'undefined' && window.location.hostname === 'localhost';
  }

  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  // 启用或禁用性能监控
  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  // 开始测量
  public startMeasure(name: string, category: string = 'default'): void {
    if (!this.enabled) return;

    const startTime = performance.now();
    this.metrics.set(name, {
      name,
      category,
      startTime,
      endTime: null,
      duration: null,
      memory: null
    });
  }

  // 结束测量
  public endMeasure(name: string): PerformanceMetric | null {
    if (!this.enabled) return null;

    const metric = this.metrics.get(name);
    if (!metric) {
      console.warn(`No performance measurement started for: ${name}`);
      return null;
    }

    const endTime = performance.now();
    const duration = endTime - metric.startTime;
    
    // 尝试获取内存使用情况（如果浏览器支持）
    let memory = null;
    try {
      // 使用类型断言访问Chrome特有的performance.memory属性
      const chromePerf = performance as any;
      if (chromePerf.memory) {
        memory = chromePerf.memory.usedJSHeapSize;
      }
    } catch (e) {
      // 忽略错误，memory保持为null
    }

    const updatedMetric = {
      ...metric,
      endTime,
      duration,
      memory
    };

    this.metrics.set(name, updatedMetric);
    
    // 在开发模式下输出性能指标
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      console.log(`Performance [${metric.category}] ${name}: ${duration.toFixed(2)}ms`);
    }

    return updatedMetric;
  }

  // 获取所有性能指标
  public getAllMetrics(): PerformanceMetric[] {
    return Array.from(this.metrics.values());
  }

  // 获取特定类别的性能指标
  public getMetricsByCategory(category: string): PerformanceMetric[] {
    return Array.from(this.metrics.values()).filter(metric => metric.category === category);
  }

  // 清除所有性能指标
  public clearMetrics(): void {
    this.metrics.clear();
  }

  // 记录组件渲染时间的React Hook包装器
  public withPerformanceTracking<P extends object>(
    Component: React.ComponentType<P>,
    name: string
  ): React.FC<P> {
    const self = this;
    
    return function PerformanceTrackedComponent(props: P) {
      const measureName = `render_${name}`;
      
      useEffect(() => {
        self.startMeasure(measureName, 'render');
        
        return () => {
          self.endMeasure(measureName);
        };
      }, []);
      
      return React.createElement(Component, props);
    };
  }
}

// 性能指标接口
export interface PerformanceMetric {
  name: string;
  category: string;
  startTime: number;
  endTime: number | null;
  duration: number | null;
  memory: number | null;
}

// 导出单例实例
export const performanceMonitor = PerformanceMonitor.getInstance();