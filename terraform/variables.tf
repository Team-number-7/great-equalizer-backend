variable "cloudwatch_web_group" {
  description = "CloudWatch web group name."
  type        = string
  default     = "web-task-group"
}

variable "cloudwatch_mongo_group" {
  description = "CloudWatch mongo group name."
  type        = string
  default     = "mongo-task-group"
}
