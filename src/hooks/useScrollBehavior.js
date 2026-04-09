import { useRef, useEffect, useCallback } from 'react';

const useScrollBehavior = ({ selectedTopic, dispatch }) => {
  const scrollRef = useRef(null);
  const virtualizerScrollToBottomRef = useRef(null);
  const previousScrollTopRef = useRef(0);
  const userScrollIntentUntilRef = useRef(0);
  const previousTopicRef = useRef(selectedTopic);

  const markUserScrollIntent = useCallback(() => {
    userScrollIntentUntilRef.current = Date.now() + 800;
  }, []);

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const previousScrollTop = previousScrollTopRef.current;
    const didScrollUp = scrollTop < previousScrollTop - 1;
    const isNearTop = scrollTop < 50;
    const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100;
    const userInitiated = userScrollIntentUntilRef.current > Date.now();
    previousScrollTopRef.current = scrollTop;
    dispatch({ type: 'PATCH', payload: { atTop: isNearTop, atBottom: isNearBottom } });
    if (userInitiated && didScrollUp && !isNearBottom) {
      dispatch({ type: 'PATCH', payload: { autoScroll: false } });
    }
  }, [dispatch]);

  // Attach scroll listener; re-attaches on topic change to reset scroll position tracking
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    previousScrollTopRef.current = el.scrollTop;
    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, [handleScroll, selectedTopic]);

  // Reset state + scroll to bottom on topic switch
  useEffect(() => {
    const previousTopic = previousTopicRef.current;
    previousTopicRef.current = selectedTopic;

    if (!selectedTopic || previousTopic === selectedTopic) return;

    dispatch({ type: 'RESET_TOPIC', topic: selectedTopic });
    userScrollIntentUntilRef.current = 0;
    previousScrollTopRef.current = 0;

    requestAnimationFrame(() => {
      if (virtualizerScrollToBottomRef.current) {
        virtualizerScrollToBottomRef.current();
        return;
      }
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    });
  }, [selectedTopic, dispatch]);

  const scrollToTop = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
      previousScrollTopRef.current = 0;
    }
    dispatch({ type: 'PATCH', payload: { atTop: true, atBottom: false, autoScroll: false } });
  }, [dispatch]);

  const scrollToBottom = useCallback(() => {
    if (virtualizerScrollToBottomRef.current) {
      virtualizerScrollToBottomRef.current();
    } else if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
    if (scrollRef.current) {
      previousScrollTopRef.current = scrollRef.current.scrollTop;
    }
    dispatch({ type: 'PATCH', payload: { atTop: false, atBottom: true, autoScroll: true } });
  }, [dispatch]);

  return {
    scrollRef,
    virtualizerScrollToBottomRef,
    markUserScrollIntent,
    scrollToTop,
    scrollToBottom,
  };
};

export default useScrollBehavior;
