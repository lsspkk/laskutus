import { TouchEvent, useState } from 'react'

interface SwipeInput {
  onSwipedLeft: () => void
  onSwipedRight: () => void
}

interface SwipeOutput {
  onTouchStart: (e: TouchEvent) => void
  onTouchMove: (e: TouchEvent) => void
  onTouchEnd: () => void
}

export const useSwipe = (input: SwipeInput): SwipeOutput => {
  const [touchStartX, setTouchStartX] = useState(0)
  const [touchEndX, setTouchEndX] = useState(0)
  const [touchStartY, setTouchStartY] = useState(0)
  const [touchEndY, setTouchEndY] = useState(0)

  const minSwipeDistance = 50

  const onTouchStart = (e: TouchEvent) => {
    setTouchEndX(0) // otherwise the swipe is fired even with usual touch events
    setTouchStartX(e.targetTouches[0].clientX)
    setTouchEndY(0) // otherwise the swipe is fired even with usual touch events
    setTouchStartY(e.targetTouches[0].clientY)
  }

  const onTouchMove = (e: TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX)
    setTouchEndY(e.targetTouches[0].clientY)
  }

  const onTouchEnd = () => {
    if (!touchStartX || !touchEndX) return
    const distanceX = touchStartX - touchEndX
    const distanceY = touchStartY - touchEndY
    const isLeftSwipe = distanceX > minSwipeDistance
    const isRightSwipe = distanceX < -minSwipeDistance
    if (isLeftSwipe && distanceX > distanceY) {
      input.onSwipedLeft()
    }
    if (isRightSwipe && Math.abs(distanceX) > distanceY) {
      input.onSwipedRight()
    }
  }

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
  }
}
