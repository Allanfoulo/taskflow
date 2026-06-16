
import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
// Tabs removed to fix rendering issues
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import format from "date-fns/format";
import { addDays } from "date-fns/addDays";
import { startOfWeek } from "date-fns/startOfWeek";
import { endOfWeek } from "date-fns/endOfWeek";
import { eachDayOfInterval } from "date-fns/eachDayOfInterval";
import { isSameDay } from "date-fns/isSameDay";
import { startOfDay } from "date-fns/startOfDay";
import { endOfDay } from "date-fns/endOfDay";
import { addWeeks } from "date-fns/addWeeks";
import { subWeeks } from "date-fns/subWeeks";
import { addMonths } from "date-fns/addMonths";
import { subMonths } from "date-fns/subMonths";
import { getDay } from "date-fns/getDay";
import { getHours } from "date-fns/getHours";
import { getMinutes } from "date-fns/getMinutes";
import { setHours } from "date-fns/setHours";
import { setMinutes } from "date-fns/setMinutes";
import { parseISO } from "date-fns/parseISO";
import { Badge } from "@/components/ui/badge";
import { CalendarClock, Users, Clock, ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Link as LinkIcon } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useProjects } from "@/contexts/ProjectContext";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";

const DEFAULT_MANUAL_EVENT_COLOR = "#4f46e5";
const DEFAULT_TASK_DUE_COLOR = "#f97316";
const NO_PROJECT_VALUE = "__no_project__";

type CalendarEventSource = "manual" | "projectDueDate" | "taskDueDate";

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  attendees: string[];
  project: string;
  projectId?: string;
  location?: string;
  color: string;
  source: CalendarEventSource;
  sourceLabel: string;
  isAllDay: boolean;
}

type NewEventFormState = {
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  attendees: string[];
  projectId: string;
  location: string;
  color: string;
};

const createInitialEventState = (baseDate = new Date()): NewEventFormState => {
  const startDate = setHours(setMinutes(baseDate, 0), 9);
  const endDate = setHours(setMinutes(baseDate, 0), 10);

  return {
    title: "",
    description: "",
    startDate,
    endDate,
    attendees: [],
    projectId: "",
    location: "",
    color: DEFAULT_MANUAL_EVENT_COLOR,
  };
};

const parseCalendarDate = (value?: string) => {
  if (!value) {
    return null;
  }

  const parsedDate = parseISO(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return parsedDate;
};

const Calendar = () => {
  const { projects } = useProjects();
  const manualEventRecords = useQuery(api.calendarEvents.list);
  const createCalendarEvent = useMutation(api.calendarEvents.create);
  const [date, setDate] = useState<Date>(new Date());
  const [view, setView] = useState<"month" | "week" | "day">("month");
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const [newEvent, setNewEvent] = useState<NewEventFormState>(createInitialEventState());
  const [attendeeInput, setAttendeeInput] = useState("");
  const [calendarOpen, setCalendarOpen] = useState(false);
  const projectNameById = new Map(projects.map((project) => [project.id, project.name]));

  const projectDueEvents: CalendarEvent[] = projects.flatMap((project) => {
    const dueDate = parseCalendarDate(project.dueDate);
    if (!dueDate) {
      return [];
    }

    return [
      {
        id: `project-due-${project.id}`,
        title: `${project.name} due`,
        description: project.description,
        startDate: startOfDay(dueDate),
        endDate: endOfDay(dueDate),
        attendees: project.members,
        project: project.name,
        projectId: project.id,
        color: project.color || DEFAULT_MANUAL_EVENT_COLOR,
        source: "projectDueDate",
        sourceLabel: "Project due date",
        isAllDay: true,
      },
    ];
  });

  const taskDueEvents: CalendarEvent[] = projects.flatMap((project) =>
    project.tasks.flatMap((task) => {
      const dueDate = parseCalendarDate(task.dueDate);
      if (!dueDate) {
        return [];
      }

      return [
        {
          id: `task-due-${task.id}`,
          title: task.title,
          description: task.description,
          startDate: startOfDay(dueDate),
          endDate: endOfDay(dueDate),
          attendees: [],
          project: project.name,
          projectId: project.id,
          color: DEFAULT_TASK_DUE_COLOR,
          source: "taskDueDate",
          sourceLabel: "Task due date",
          isAllDay: true,
        },
      ];
    }),
  );

  const manualEvents: CalendarEvent[] = (manualEventRecords || []).flatMap((event) => {
    const startDate = parseCalendarDate(event.startDate);
    const endDate = parseCalendarDate(event.endDate);
    if (!startDate || !endDate) {
      return [];
    }

    const projectId = event.projectId ? String(event.projectId) : undefined;

    return [
      {
        id: String(event.id),
        title: event.title,
        description: event.description,
        startDate,
        endDate,
        attendees: event.attendees,
        project: projectId ? (projectNameById.get(projectId) || "Linked project") : "Standalone event",
        projectId,
        location: event.location,
        color: event.color || DEFAULT_MANUAL_EVENT_COLOR,
        source: "manual",
        sourceLabel: "Manual event",
        isAllDay: false,
      },
    ];
  });

  const events = [...manualEvents, ...projectDueEvents, ...taskDueEvents].sort(
    (left, right) => left.startDate.getTime() - right.startDate.getTime(),
  );

  // Handle navigation between weeks/months/days
  const navigatePrevious = () => {
    if (view === "month") {
      setDate(subMonths(date, 1));
    } else if (view === "week") {
      setDate(subWeeks(date, 1));
    } else if (view === "day") {
      setDate(addDays(date, -1));
    }
  };
  
  const navigateNext = () => {
    if (view === "month") {
      setDate(addMonths(date, 1));
    } else if (view === "week") {
      setDate(addWeeks(date, 1));
    } else if (view === "day") {
      setDate(addDays(date, 1));
    }
  };
  
  const navigateToday = () => {
    setDate(new Date());
  };
  
  // Get events for different views
  const getEventsForDate = (day: Date) => {
    return events.filter((event) => isSameDay(event.startDate, day));
  };
  
  const getEventsForWeek = () => {
    const start = startOfWeek(date, { weekStartsOn: 0 });
    const end = endOfWeek(date, { weekStartsOn: 0 });
    return events.filter((event) => event.startDate >= start && event.startDate <= end);
  };
  
  const getDaysOfWeek = () => {
    const start = startOfWeek(date, { weekStartsOn: 0 });
    const end = endOfWeek(date, { weekStartsOn: 0 });
    return eachDayOfInterval({ start, end });
  };
  
  // Handle event creation
  const handleCreateEvent = async () => {
    if (!newEvent.title) {
      toast({
        title: "Event title required",
        description: "Please enter a title for your event",
        variant: "destructive",
      });
      return;
    }

    if (newEvent.endDate < newEvent.startDate) {
      toast({
        title: "Invalid event time",
        description: "End time must be after the start time",
        variant: "destructive",
      });
      return;
    }

    setIsCreatingEvent(true);

    try {
      await createCalendarEvent({
        title: newEvent.title,
        description: newEvent.description || undefined,
        startDate: newEvent.startDate.toISOString(),
        endDate: newEvent.endDate.toISOString(),
        attendees: newEvent.attendees,
        projectId: newEvent.projectId ? (newEvent.projectId as Id<"projects">) : undefined,
        location: newEvent.location || undefined,
        color: newEvent.color || DEFAULT_MANUAL_EVENT_COLOR,
      });

      setIsCreateEventOpen(false);
      setNewEvent(createInitialEventState());
      setAttendeeInput("");

      toast({
        title: "Event created",
        description: `${newEvent.title} has been added to your calendar`,
      });
    } catch (error) {
      console.error("Failed to create calendar event", error);
      toast({
        title: "Unable to create event",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingEvent(false);
    }
  };
  
  const addAttendee = () => {
    if (attendeeInput.trim() && !newEvent.attendees?.includes(attendeeInput.trim())) {
      setNewEvent({
        ...newEvent,
        attendees: [...(newEvent.attendees || []), attendeeInput.trim()]
      });
      setAttendeeInput("");
    }
  };
  
  const removeAttendee = (attendee: string) => {
    setNewEvent({
      ...newEvent,
      attendees: newEvent.attendees?.filter(a => a !== attendee)
    });
  };

  const openCreateEventDialogForDay = (selectedDate: Date) => {
    setNewEvent(createInitialEventState(selectedDate));
    setAttendeeInput("");
    setIsCreateEventOpen(true);
  };

  const formatEventTime = (event: CalendarEvent) => {
    if (event.isAllDay) {
      return "All day";
    }

    return `${format(event.startDate, "h:mm a")} - ${format(event.endDate, "h:mm a")}`;
  };

  const getMonthEventLabel = (event: CalendarEvent) => {
    if (event.isAllDay) {
      return event.source === "taskDueDate" ? `Task due: ${event.title}` : event.title;
    }

    return `${format(event.startDate, "h:mm a")} ${event.title}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>

        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={navigatePrevious}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={navigateToday}>
            Today
          </Button>
          <Button variant="outline" size="sm" onClick={navigateNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">
          {view === 'month' && format(date, 'MMMM yyyy')}
          {view === 'week' && `Week of ${format(startOfWeek(date), 'MMM d')} - ${format(endOfWeek(date), 'MMM d, yyyy')}`}
          {view === 'day' && format(date, 'MMMM d, yyyy')}
        </h2>

        <div className="flex space-x-2">
          <div className="border rounded-md p-1 flex space-x-1">
            <Button
              variant={view === 'month' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setView('month')}
              className="text-xs"
            >
              Month
            </Button>
            <Button
              variant={view === 'week' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setView('week')}
              className="text-xs"
            >
              Week
            </Button>
            <Button
              variant={view === 'day' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setView('day')}
              className="text-xs"
            >
              Day
            </Button>
          </div>

          <Dialog open={isCreateEventOpen} onOpenChange={setIsCreateEventOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Event
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create New Event</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="eventTitle">Event Title</Label>
                  <Input
                    id="eventTitle"
                    value={newEvent.title || ""}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    placeholder="Enter event title"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="eventDescription">Description</Label>
                  <Textarea
                    id="eventDescription"
                    value={newEvent.description || ""}
                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                    placeholder="Enter event description"
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Date & Time</Label>
                    <div className="flex flex-col space-y-2">
                      <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "justify-start text-left font-normal",
                              !newEvent.startDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {newEvent.startDate ? format(newEvent.startDate, "PPP") : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <CalendarComponent
                            mode="single"
                            selected={newEvent.startDate}
                            onSelect={(date) => {
                              if (date) {
                                const hours = newEvent.startDate ? getHours(newEvent.startDate) : 9;
                                const minutes = newEvent.startDate ? getMinutes(newEvent.startDate) : 0;
                                const newStartDate = setHours(setMinutes(date, minutes), hours);
                                setNewEvent({ ...newEvent, startDate: newStartDate });
                                
                                // Also update end date if not set or if before start date
                                if (!newEvent.endDate || newEvent.endDate < newStartDate) {
                                  const newEndDate = setHours(setMinutes(date, minutes), hours + 1);
                                  setNewEvent(prev => ({ ...prev, endDate: newEndDate }));
                                }
                              }
                              setCalendarOpen(false);
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                      
                      <div className="flex space-x-2">
                        <Select
                          value={newEvent.startDate ? getHours(newEvent.startDate).toString() : "9"}
                          onValueChange={(value) => {
                            if (newEvent.startDate) {
                              const newDate = setHours(newEvent.startDate, parseInt(value));
                              setNewEvent({ ...newEvent, startDate: newDate });
                            }
                          }}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Hour" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 24 }, (_, i) => (
                              <SelectItem key={i} value={i.toString()}>
                                {i === 0 ? "12 AM" : i < 12 ? `${i} AM` : i === 12 ? "12 PM" : `${i - 12} PM`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        
                        <Select
                          value={newEvent.startDate ? (getMinutes(newEvent.startDate) === 0 ? "0" : "30") : "0"}
                          onValueChange={(value) => {
                            if (newEvent.startDate) {
                              const newDate = setMinutes(newEvent.startDate, parseInt(value));
                              setNewEvent({ ...newEvent, startDate: newDate });
                            }
                          }}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Minute" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0">00</SelectItem>
                            <SelectItem value="30">30</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>End Date & Time</Label>
                    <div className="flex flex-col space-y-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "justify-start text-left font-normal",
                              !newEvent.endDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {newEvent.endDate ? format(newEvent.endDate, "PPP") : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <CalendarComponent
                            mode="single"
                            selected={newEvent.endDate}
                            onSelect={(date) => {
                              if (date) {
                                const hours = newEvent.endDate ? getHours(newEvent.endDate) : 10;
                                const minutes = newEvent.endDate ? getMinutes(newEvent.endDate) : 0;
                                setNewEvent({ ...newEvent, endDate: setHours(setMinutes(date, minutes), hours) });
                              }
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                      
                      <div className="flex space-x-2">
                        <Select
                          value={newEvent.endDate ? getHours(newEvent.endDate).toString() : "10"}
                          onValueChange={(value) => {
                            if (newEvent.endDate) {
                              const newDate = setHours(newEvent.endDate, parseInt(value));
                              setNewEvent({ ...newEvent, endDate: newDate });
                            }
                          }}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Hour" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 24 }, (_, i) => (
                              <SelectItem key={i} value={i.toString()}>
                                {i === 0 ? "12 AM" : i < 12 ? `${i} AM` : i === 12 ? "12 PM" : `${i - 12} PM`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        
                        <Select
                          value={newEvent.endDate ? (getMinutes(newEvent.endDate) === 0 ? "0" : "30") : "0"}
                          onValueChange={(value) => {
                            if (newEvent.endDate) {
                              const newDate = setMinutes(newEvent.endDate, parseInt(value));
                              setNewEvent({ ...newEvent, endDate: newDate });
                            }
                          }}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Minute" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0">00</SelectItem>
                            <SelectItem value="30">30</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="eventProject">Linked Project</Label>
                  <Select
                    value={newEvent.projectId || NO_PROJECT_VALUE}
                    onValueChange={(value) =>
                      setNewEvent({
                        ...newEvent,
                        projectId: value === NO_PROJECT_VALUE ? "" : value,
                      })
                    }
                  >
                    <SelectTrigger id="eventProject">
                      <SelectValue placeholder="Select a project" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NO_PROJECT_VALUE}>No linked project</SelectItem>
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Link the event to a project when it belongs to planned work. Leave it standalone for meetings or reminders.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="eventLocation">Location</Label>
                  <Input
                    id="eventLocation"
                    value={newEvent.location || ""}
                    onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                    placeholder="Enter event location"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="eventColor">Color</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="color"
                      id="eventColor"
                      value={newEvent.color || "#4f46e5"}
                      onChange={(e) => setNewEvent({ ...newEvent, color: e.target.value })}
                      className="w-12 h-8 p-1"
                    />
                    <div 
                      className="w-8 h-8 rounded-full border"
                      style={{ backgroundColor: newEvent.color || "#4f46e5" }}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Attendees</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={attendeeInput}
                      onChange={(e) => setAttendeeInput(e.target.value)}
                      placeholder="Add attendee"
                      onKeyDown={(e) => e.key === "Enter" && addAttendee()}
                    />
                    <Button type="button" variant="outline" onClick={addAttendee}>
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {newEvent.attendees?.map((attendee) => (
                      <Badge key={attendee} variant="secondary" className="px-2 py-1">
                        {attendee}
                        <button
                          className="ml-1 text-muted-foreground hover:text-foreground"
                          onClick={() => removeAttendee(attendee)}
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateEventOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => void handleCreateEvent()} disabled={isCreatingEvent}>
                  {isCreatingEvent ? "Creating..." : "Create Event"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {view === 'month' && (
        <Card>
          <CardContent className="p-0">
            <div className="grid grid-cols-7 gap-px bg-muted">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="p-2 text-center text-sm font-medium">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-px bg-muted">
              {Array.from({ length: 35 }, (_, i) => {
                const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
                const dayOffset = getDay(firstDayOfMonth);
                const day = new Date(date.getFullYear(), date.getMonth(), i - dayOffset + 1);
                const isCurrentMonth = day.getMonth() === date.getMonth();
                const isToday = isSameDay(day, new Date());
                const dayEvents = getEventsForDate(day);

                return (
                  <div
                    key={i}
                    className={cn(
                      'min-h-[100px] p-2 bg-background transition-colors',
                      !isCurrentMonth && 'text-muted-foreground bg-muted/30',
                      isToday && 'border-2 border-primary',
                      isSameDay(day, date) && 'bg-muted/50'
                    )}
                    onClick={() => setDate(day)}
                  >
                    <div className="font-medium text-sm mb-1">{format(day, 'd')}</div>
                    <div className="space-y-1">
                      {dayEvents.slice(0, 3).map((event) => (
                        <div
                          key={event.id}
                          className="text-xs truncate rounded px-1 py-0.5"
                          style={{ backgroundColor: `${event.color}20`, color: event.color }}
                        >
                          {getMonthEventLabel(event)}
                        </div>
                      ))}
                      {dayEvents.length > 3 && (
                        <div className="text-xs text-muted-foreground">
                          +{dayEvents.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {view === 'week' && (
        <Card>
          <CardContent className="p-0">
            <div className="grid grid-cols-7 gap-px bg-muted">
              {getDaysOfWeek().map((day) => (
                <div
                  key={day.toISOString()}
                  className={cn(
                    'p-2 text-center',
                    isSameDay(day, new Date()) && 'bg-muted/50 font-bold'
                  )}
                >
                  <div className="text-sm font-medium">{format(day, 'EEE')}</div>
                  <div className="text-lg">{format(day, 'd')}</div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-px bg-muted">
              {getDaysOfWeek().map((day) => {
                const dayEvents = getEventsForDate(day);

                return (
                  <div
                    key={day.toISOString()}
                    className={cn(
                      'min-h-[300px] p-2 bg-background',
                      isSameDay(day, new Date()) && 'bg-muted/20'
                    )}
                    onClick={() => {
                      setDate(day);
                      setView('day');
                    }}
                  >
                    <div className="space-y-1">
                      {dayEvents.map((event) => (
                        <div
                          key={event.id}
                          className="text-sm p-2 mb-1 rounded truncate"
                          style={{ backgroundColor: `${event.color}20`, color: event.color, borderLeft: `3px solid ${event.color}` }}
                        >
                          <div className="font-medium truncate">{event.title}</div>
                          <div className="text-xs flex items-center gap-2">
                            <span>{formatEventTime(event)}</span>
                            <span className="opacity-80">{event.sourceLabel}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {view === 'day' && (
        <div className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Select Date</CardTitle>
              </CardHeader>
              <CardContent>
                <CalendarComponent
                  mode="single"
                  selected={date}
                  onSelect={(selectedDate) => {
                    if (selectedDate) {
                      setDate(selectedDate);
                    }
                  }}
                  className="rounded-md border"
                />
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>
                  {format(date, 'EEEE, MMMM d, yyyy')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {getEventsForDate(date).length > 0 ? (
                  <div className="space-y-4">
                    {getEventsForDate(date).map((event) => (
                      <div
                        key={event.id}
                        className="p-4 border rounded-lg hover:bg-secondary transition-colors"
                        style={{ borderLeft: `4px solid ${event.color}` }}
                      >
                        <div className="flex justify-between items-start">
                          <div className="space-y-2">
                            <h3 className="font-medium text-lg">{event.title}</h3>
                            <div className="flex flex-wrap gap-2">
                              <Badge variant="secondary">{event.sourceLabel}</Badge>
                              <Badge variant="outline">{event.project}</Badge>
                            </div>
                          </div>
                        </div>
                        {event.description && (
                          <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                        )}
                        <div className="mt-2 flex flex-col space-y-2">
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Clock className="mr-2 h-4 w-4" />
                            {formatEventTime(event)}
                          </div>
                          {event.location && (
                            <div className="flex items-center text-sm text-muted-foreground">
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {event.location}
                            </div>
                          )}
                          {event.projectId && (
                            <div className="flex items-center text-sm text-muted-foreground">
                              <LinkIcon className="mr-2 h-4 w-4" />
                              Linked to {event.project}
                            </div>
                          )}
                          {event.attendees.length > 0 && (
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Users className="mr-2 h-4 w-4" />
                              {event.attendees.join(", ")}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
                    <CalendarClock className="h-12 w-12 mb-4" />
                    <p>No events scheduled for this day</p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => openCreateEventDialogForDay(date)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Event
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
