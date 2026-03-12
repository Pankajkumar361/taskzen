import Iter "mo:core/Iter";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Order "mo:core/Order";
import Array "mo:core/Array";
import Int "mo:core/Int";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  type TaskStatus = {
    #pending;
    #completed;
  };

  type Task = {
    id : Nat;
    title : Text;
    status : TaskStatus;
    reminderTime : ?Text;
    createdAt : Int;
    sortOrder : Nat;
  };

  module Task {
    public func compare(task1 : Task, task2 : Task) : Order.Order {
      switch (Nat.compare(task1.sortOrder, task2.sortOrder)) {
        case (#equal) {
          Int.compare(task1.createdAt, task2.createdAt);
        };
        case (order) { order };
      };
    };
  };

  let userTasks = Map.empty<Principal, Map.Map<Nat, Task>>();
  var nextTaskId = 1;

  public shared ({ caller }) func addTask(title : Text, reminderTime : ?Text) : async Nat {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can add tasks");
    };

    let taskId = nextTaskId;
    nextTaskId += 1;

    let task : Task = {
      id = taskId;
      title;
      status = #pending;
      reminderTime;
      createdAt = Time.now();
      sortOrder = taskId;
    };

    let tasks = switch (userTasks.get(caller)) {
      case (null) { Map.empty<Nat, Task>() };
      case (?existing) { existing };
    };

    tasks.add(taskId, task);
    userTasks.add(caller, tasks);
    taskId;
  };

  public query ({ caller }) func getTasks() : async [Task] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get tasks");
    };

    switch (userTasks.get(caller)) {
      case (null) { [] };
      case (?tasks) {
        tasks.values().toArray().sort();
      };
    };
  };

  public shared ({ caller }) func updateTask(id : Nat, title : Text, reminderTime : ?Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update tasks");
    };

    switch (userTasks.get(caller)) {
      case (null) { Runtime.trap("Task not found") };
      case (?tasks) {
        switch (tasks.get(id)) {
          case (null) { Runtime.trap("Task not found") };
          case (?existing) {
            let updatedTask : Task = {
              id = existing.id;
              title;
              status = existing.status;
              reminderTime;
              createdAt = existing.createdAt;
              sortOrder = existing.sortOrder;
            };
            tasks.add(id, updatedTask);
          };
        };
      };
    };
  };

  public shared ({ caller }) func deleteTask(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete tasks");
    };

    switch (userTasks.get(caller)) {
      case (null) { Runtime.trap("Task not found") };
      case (?tasks) {
        if (not tasks.containsKey(id)) {
          Runtime.trap("Task not found");
        };
        tasks.remove(id);
      };
    };
  };

  public shared ({ caller }) func toggleTask(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can toggle tasks");
    };

    switch (userTasks.get(caller)) {
      case (null) { Runtime.trap("Task not found") };
      case (?tasks) {
        switch (tasks.get(id)) {
          case (null) { Runtime.trap("Task not found") };
          case (?task) {
            let updatedTask = {
              id = task.id;
              title = task.title;
              status = switch (task.status) {
                case (#pending) { #completed };
                case (#completed) { #pending };
              };
              reminderTime = task.reminderTime;
              createdAt = task.createdAt;
              sortOrder = task.sortOrder;
            };
            tasks.add(id, updatedTask);
          };
        };
      };
    };
  };

  public shared ({ caller }) func reorderTask(id : Nat, newSortOrder : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can reorder tasks");
    };

    switch (userTasks.get(caller)) {
      case (null) { Runtime.trap("Task not found") };
      case (?tasks) {
        switch (tasks.get(id)) {
          case (null) { Runtime.trap("Task not found") };
          case (?task) {
            let updatedTask = {
              id = task.id;
              title = task.title;
              status = task.status;
              reminderTime = task.reminderTime;
              createdAt = task.createdAt;
              sortOrder = newSortOrder;
            };
            tasks.add(id, updatedTask);
          };
        };
      };
    };
  };
};
