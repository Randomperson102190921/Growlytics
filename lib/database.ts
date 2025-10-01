import { database } from './firebase'
import { ref, set, get, push, update, remove, onValue, off } from 'firebase/database'

export interface Plant {
  id: string
  name: string
  type: string
  photo?: string
  dateAdded: string
  lastWatered?: string
  nextWatering?: string
  notes?: string
}

export interface Reminder {
  id: string
  plantId: string
  type: "watering" | "fertilizing" | "pruning" | "repotting" | "other"
  frequency: number // days
  lastDone?: string
  nextDue: string
  customName?: string
}

export interface Task {
  id: string
  plantId: string
  reminderId: string
  type: string
  dueDate: string
  completed: boolean
  completedDate?: string
}

export interface UserSettings {
  notifications: {
    email: boolean
    push: boolean
    reminders: boolean
  }
  preferences: {
    theme: "light" | "dark" | "system"
    defaultReminderFrequency: number
    showCompletedTasks: boolean
  }
}

// Plants operations
export const savePlant = async (userId: string, plant: Plant) => {
  try {
    const plantRef = ref(database, `users/${userId}/plants/${plant.id}`)
    // Clean the plant data by converting undefined to null
    const cleanPlant = Object.fromEntries(
      Object.entries(plant).map(([key, value]) => [key, value === undefined ? null : value])
    )
    await set(plantRef, cleanPlant)
  } catch (error) {
    console.error('Error saving plant:', error)
    throw new Error('Failed to save plant')
  }
}

export const getPlants = async (userId: string): Promise<Plant[]> => {
  const plantsRef = ref(database, `users/${userId}/plants`)
  const snapshot = await get(plantsRef)
  if (snapshot.exists()) {
    const plants = snapshot.val()
    return Object.values(plants) as Plant[]
  }
  return []
}

export const deletePlant = async (userId: string, plantId: string) => {
  const plantRef = ref(database, `users/${userId}/plants/${plantId}`)
  await remove(plantRef)
}

export const subscribeToPlants = (userId: string, callback: (plants: Plant[]) => void) => {
  const plantsRef = ref(database, `users/${userId}/plants`)
  const unsubscribe = onValue(plantsRef, (snapshot) => {
    if (snapshot.exists()) {
      const plants = snapshot.val()
      callback(Object.values(plants) as Plant[])
    } else {
      callback([])
    }
  })
  return () => off(plantsRef, 'value', unsubscribe)
}

// Reminders operations
export const saveReminder = async (userId: string, reminder: Reminder) => {
  const reminderRef = ref(database, `users/${userId}/reminders/${reminder.id}`)
  // Clean the reminder data by converting undefined to null
  const cleanReminder = Object.fromEntries(
    Object.entries(reminder).map(([key, value]) => [key, value === undefined ? null : value])
  )
  await set(reminderRef, cleanReminder)
}

export const getReminders = async (userId: string): Promise<Reminder[]> => {
  const remindersRef = ref(database, `users/${userId}/reminders`)
  const snapshot = await get(remindersRef)
  if (snapshot.exists()) {
    const reminders = snapshot.val()
    return Object.values(reminders) as Reminder[]
  }
  return []
}

export const deleteReminder = async (userId: string, reminderId: string) => {
  const reminderRef = ref(database, `users/${userId}/reminders/${reminderId}`)
  await remove(reminderRef)
}

export const subscribeToReminders = (userId: string, callback: (reminders: Reminder[]) => void) => {
  const remindersRef = ref(database, `users/${userId}/reminders`)
  const unsubscribe = onValue(remindersRef, (snapshot) => {
    if (snapshot.exists()) {
      const reminders = snapshot.val()
      callback(Object.values(reminders) as Reminder[])
    } else {
      callback([])
    }
  })
  return () => off(remindersRef, 'value', unsubscribe)
}

// Tasks operations
export const saveTask = async (userId: string, task: Task) => {
  const taskRef = ref(database, `users/${userId}/tasks/${task.id}`)
  // Clean the task data by converting undefined to null
  const cleanTask = Object.fromEntries(
    Object.entries(task).map(([key, value]) => [key, value === undefined ? null : value])
  )
  await set(taskRef, cleanTask)
}

export const getTasks = async (userId: string): Promise<Task[]> => {
  const tasksRef = ref(database, `users/${userId}/tasks`)
  const snapshot = await get(tasksRef)
  if (snapshot.exists()) {
    const tasks = snapshot.val()
    return Object.values(tasks) as Task[]
  }
  return []
}

export const updateTask = async (userId: string, taskId: string, updates: Partial<Task>) => {
  const taskRef = ref(database, `users/${userId}/tasks/${taskId}`)
  await update(taskRef, updates)
}

export const deleteTask = async (userId: string, taskId: string) => {
  const taskRef = ref(database, `users/${userId}/tasks/${taskId}`)
  await remove(taskRef)
}

export const subscribeToTasks = (userId: string, callback: (tasks: Task[]) => void) => {
  const tasksRef = ref(database, `users/${userId}/tasks`)
  const unsubscribe = onValue(tasksRef, (snapshot) => {
    if (snapshot.exists()) {
      const tasks = snapshot.val()
      callback(Object.values(tasks) as Task[])
    } else {
      callback([])
    }
  })
  return () => off(tasksRef, 'value', unsubscribe)
}

// Settings operations
export const saveSettings = async (userId: string, settings: UserSettings) => {
  const settingsRef = ref(database, `users/${userId}/settings`)
  // Clean the settings data by converting undefined to null
  const cleanSettings = Object.fromEntries(
    Object.entries(settings).map(([key, value]) => [key, value === undefined ? null : value])
  )
  await set(settingsRef, cleanSettings)
}

export const getSettings = async (userId: string): Promise<UserSettings | null> => {
  const settingsRef = ref(database, `users/${userId}/settings`)
  const snapshot = await get(settingsRef)
  if (snapshot.exists()) {
    return snapshot.val() as UserSettings
  }
  return null
}

export const subscribeToSettings = (userId: string, callback: (settings: UserSettings | null) => void) => {
  const settingsRef = ref(database, `users/${userId}/settings`)
  const unsubscribe = onValue(settingsRef, (snapshot: any) => {
    if (snapshot.exists()) {
      callback(snapshot.val() as UserSettings)
    } else {
      callback(null)
    }
  })
  return () => off(settingsRef, 'value', unsubscribe)
}

// Batch operations for data migration
export const saveUserData = async (userId: string, data: { plants: Plant[], reminders: Reminder[], tasks: Task[] }) => {
  const userRef = ref(database, `users/${userId}`)
  await set(userRef, {
    plants: data.plants.reduce((acc, plant) => ({ ...acc, [plant.id]: plant }), {}),
    reminders: data.reminders.reduce((acc, reminder) => ({ ...acc, [reminder.id]: reminder }), {}),
    tasks: data.tasks.reduce((acc, task) => ({ ...acc, [task.id]: task }), {}),
  })
}