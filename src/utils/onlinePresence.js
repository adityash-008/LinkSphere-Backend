const onlineUserCounts = new Map()

const markUserOnline = (userId) => {
  const key = userId.toString()
  const nextCount = (onlineUserCounts.get(key) || 0) + 1
  onlineUserCounts.set(key, nextCount)
  return nextCount === 1
}

const markUserOffline = (userId) => {
  const key = userId.toString()
  const currentCount = onlineUserCounts.get(key) || 0
  const nextCount = Math.max(0, currentCount - 1)

  if (nextCount === 0) {
    onlineUserCounts.delete(key)
    return true
  }

  onlineUserCounts.set(key, nextCount)
  return false
}

const isUserOnline = (userId) => {
  return onlineUserCounts.has(userId.toString())
}

const getOnlineUserIds = () => {
  return Array.from(onlineUserCounts.keys())
}

module.exports = {
  getOnlineUserIds,
  isUserOnline,
  markUserOffline,
  markUserOnline,
}
