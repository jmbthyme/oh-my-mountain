import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useToast } from '../useToast';

describe('useToast', () => {
  it('initializes with empty toasts array', () => {
    const { result } = renderHook(() => useToast());
    
    expect(result.current.toasts).toEqual([]);
  });

  it('adds a toast with addToast', () => {
    const { result } = renderHook(() => useToast());
    
    act(() => {
      result.current.addToast('success', 'Test Title', 'Test Message');
    });
    
    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0]).toMatchObject({
      type: 'success',
      title: 'Test Title',
      message: 'Test Message',
    });
    expect(result.current.toasts[0].id).toBeDefined();
  });

  it('removes a toast with removeToast', () => {
    const { result } = renderHook(() => useToast());
    
    let toastId: string;
    
    act(() => {
      toastId = result.current.addToast('info', 'Test Toast');
    });
    
    expect(result.current.toasts).toHaveLength(1);
    
    act(() => {
      result.current.removeToast(toastId);
    });
    
    expect(result.current.toasts).toHaveLength(0);
  });

  it('clears all toasts with clearAllToasts', () => {
    const { result } = renderHook(() => useToast());
    
    act(() => {
      result.current.addToast('success', 'Toast 1');
      result.current.addToast('error', 'Toast 2');
      result.current.addToast('warning', 'Toast 3');
    });
    
    expect(result.current.toasts).toHaveLength(3);
    
    act(() => {
      result.current.clearAllToasts();
    });
    
    expect(result.current.toasts).toHaveLength(0);
  });

  it('adds success toast with showSuccess', () => {
    const { result } = renderHook(() => useToast());
    
    act(() => {
      result.current.showSuccess('Success!', 'Operation completed');
    });
    
    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0]).toMatchObject({
      type: 'success',
      title: 'Success!',
      message: 'Operation completed',
    });
  });

  it('adds error toast with showError', () => {
    const { result } = renderHook(() => useToast());
    
    act(() => {
      result.current.showError('Error!', 'Something went wrong');
    });
    
    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0]).toMatchObject({
      type: 'error',
      title: 'Error!',
      message: 'Something went wrong',
    });
  });

  it('adds warning toast with showWarning', () => {
    const { result } = renderHook(() => useToast());
    
    act(() => {
      result.current.showWarning('Warning!', 'Please be careful');
    });
    
    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0]).toMatchObject({
      type: 'warning',
      title: 'Warning!',
      message: 'Please be careful',
    });
  });

  it('adds info toast with showInfo', () => {
    const { result } = renderHook(() => useToast());
    
    act(() => {
      result.current.showInfo('Info', 'Here is some information');
    });
    
    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0]).toMatchObject({
      type: 'info',
      title: 'Info',
      message: 'Here is some information',
    });
  });

  it('generates unique IDs for each toast', () => {
    const { result } = renderHook(() => useToast());
    
    act(() => {
      result.current.addToast('info', 'Toast 1');
      result.current.addToast('info', 'Toast 2');
      result.current.addToast('info', 'Toast 3');
    });
    
    const ids = result.current.toasts.map(toast => toast.id);
    const uniqueIds = new Set(ids);
    
    expect(uniqueIds.size).toBe(3);
  });

  it('supports custom duration', () => {
    const { result } = renderHook(() => useToast());
    
    act(() => {
      result.current.addToast('info', 'Custom Duration', 'Message', 10000);
    });
    
    expect(result.current.toasts[0].duration).toBe(10000);
  });

  it('returns toast ID from convenience methods', () => {
    const { result } = renderHook(() => useToast());
    
    let toastId: string;
    
    act(() => {
      toastId = result.current.showSuccess('Success');
    });
    
    expect(toastId).toBeDefined();
    expect(typeof toastId).toBe('string');
    expect(result.current.toasts[0].id).toBe(toastId);
  });
});