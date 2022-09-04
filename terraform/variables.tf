variable "cloudwatch_api_group" {
  description = "CloudWatch web group name."
  type        = string
  default     = "api-task-group"
}

variable "cloudwatch_mongo_group" {
  description = "CloudWatch mongo group name."
  type        = string
  default     = "mongo-task-group"
}

variable "cloudwatch_frontend_group" {
  description = "CloudWatch web group name."
  type        = string
  default     = "frontend-task-group"
}