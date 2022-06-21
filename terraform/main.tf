terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.19"
    }
  }

  required_version = ">= 1.2.3"
}

provider "aws" {
  profile = "default"
  region  = "us-east-1"

  default_tags {
    tags = {
      team = "Team 7"
    }
  }
}

resource "aws_vpc" "team_7" {
  cidr_block           = "12.0.0.0/16"
  enable_dns_hostnames = true

  tags = {
    "Name" = "Team 7 web"
  }
}

resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.team_7.id

  tags = {
    "Name" = "Internet gateway"
  }
}

resource "aws_subnet" "public_1" {
  vpc_id                  = aws_vpc.team_7.id
  cidr_block              = "12.0.0.0/24"
  map_public_ip_on_launch = true
  availability_zone       = "us-east-1a"

  tags = {
    "Name" = "Public subnet 1"
  }
}

resource "aws_subnet" "public_2" {
  vpc_id                  = aws_vpc.team_7.id
  cidr_block              = "12.0.1.0/24"
  map_public_ip_on_launch = true
  availability_zone       = "us-east-1b"

  tags = {
    "Name" = "Public subnet 2"
  }
}

resource "aws_nat_gateway" "nat_gateway" {
  subnet_id         = aws_subnet.public_1.id
  allocation_id     = aws_eip.nat_ip.id
  connectivity_type = "public"

  tags = {
    "Name" = "Nat gateway"
  }
}

resource "aws_eip" "nat_ip" {
  vpc = true
}

resource "aws_route_table" "routing_table_public" {
  vpc_id = aws_vpc.team_7.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.igw.id

  }
}

resource "aws_route_table" "routing_table_private" {
  vpc_id = aws_vpc.team_7.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_nat_gateway.nat_gateway.id
  }
}

resource "aws_subnet" "private" {
  vpc_id                  = aws_vpc.team_7.id
  cidr_block              = "12.0.2.0/24"
  map_public_ip_on_launch = false
  availability_zone       = "us-east-1a"

  tags = {
    "Name" = "Subnet private"
  }
}

resource "aws_route_table_association" "rtba_public_1" {
  subnet_id      = aws_subnet.public_1.id
  route_table_id = aws_route_table.routing_table_public.id
}

resource "aws_route_table_association" "rtba_public_2" {
  subnet_id      = aws_subnet.public_2.id
  route_table_id = aws_route_table.routing_table_public.id
}

resource "aws_route_table_association" "rtba_private" {
  subnet_id      = aws_subnet.private.id
  route_table_id = aws_route_table.routing_table_private.id
}

resource "aws_security_group" "load_balancer_sg" {
  vpc_id = aws_vpc.team_7.id
  ingress {
    cidr_blocks = ["0.0.0.0/0"]
    description = "HTTP from everywhere"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
  }
  egress {
    cidr_blocks = ["0.0.0.0/0"]
    description = "all to everywhere"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
  }
}

resource "aws_security_group" "efs_private_sg" {
  vpc_id = aws_vpc.team_7.id
  ingress {
    cidr_blocks = ["0.0.0.0/0"]
    description = "NFS from everywhere"
    from_port   = 2049
    to_port     = 2049
    protocol    = "tcp"
  }
  egress {
    cidr_blocks = ["0.0.0.0/0"]
    description = "all to everywhere"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
  }
}

resource "aws_security_group" "mongo_private_sg" {
  vpc_id = aws_vpc.team_7.id
  ingress {
    cidr_blocks = ["0.0.0.0/0"]
    description = "mongo from everywhere"
    from_port   = 27017
    to_port     = 27017
    protocol    = "tcp"
  }
  egress {
    cidr_blocks = ["0.0.0.0/0"]
    description = "all to everywhere"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
  }
}

resource "aws_security_group" "web_server_sg" {
  vpc_id = aws_vpc.team_7.id
  ingress {
    cidr_blocks = ["0.0.0.0/0"]
    description = "TCP from everywhere"
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
  }
  egress {
    cidr_blocks = ["0.0.0.0/0"]
    description = "all to everywhere"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
  }
}

resource "aws_alb" "web_lb" {
  name               = "web-lb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.load_balancer_sg.id]
  subnets            = [aws_subnet.public_1.id, aws_subnet.public_2.id]
}

resource "aws_lb_target_group" "ge_web" {
  name        = "ge-web-lb-tg"
  port        = 3000
  protocol    = "HTTP"
  target_type = "ip"
  vpc_id      = aws_vpc.team_7.id
  health_check {
    enabled  = true
    interval = 60
    path     = "/health"
  }
}

resource "aws_alb_listener" "alb_listener" {
  load_balancer_arn = aws_alb.web_lb.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    target_group_arn = aws_lb_target_group.ge_web.arn
    type             = "forward"
  }
}

resource "aws_efs_file_system" "mongo_private_efs" {
  encrypted              = true
  availability_zone_name = "us-east-1a"
}

resource "aws_efs_mount_target" "mongo_efs_mt" {
  file_system_id  = aws_efs_file_system.mongo_private_efs.id
  subnet_id       = aws_subnet.private.id
  security_groups = [aws_security_group.efs_private_sg.id]
}

resource "aws_ecs_cluster" "ge_cluster" {
  name = "ge_cluster"

  setting {
    name  = "containerInsights"
    value = "disabled"
  }
}

resource "aws_ecs_cluster_capacity_providers" "ge_cluster" {
  cluster_name = aws_ecs_cluster.ge_cluster.name

  capacity_providers = ["FARGATE"]

  default_capacity_provider_strategy {
    capacity_provider = "FARGATE"
  }
}

resource "aws_ecs_task_definition" "ge_mongo" {
  family                   = "ge_mongo"
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = 256
  memory                   = 512

  container_definitions = <<TASK_DEFINITION
[
  {
    "name": "mongo",
    "image": "mongo:5.0.8",
    "cpu": 256,
    "memory": 512,
    "essential": true,
    "portMappings": [
            {
               "containerPort": 27017,
               "protocol": "tcp"
            }
    ],
    "mountPoints": [
                {
                    "sourceVolume": "mongo_efs",
                    "containerPath": "/data/db",
                    "readOnly": false
                }
            ],
    "environment": [
                {
                    "name": "MONGO_INITDB_ROOT_PASSWORD",
                    "value": "example"
                },
                {
                    "name": "MONGO_INITDB_ROOT_USERNAME",
                    "value": "root"
                }
            ]
  }
]
TASK_DEFINITION

  volume {
    name = "mongo_efs"

    efs_volume_configuration {
      file_system_id     = aws_efs_file_system.mongo_private_efs.id
      root_directory     = "/"
      transit_encryption = "ENABLED"

      authorization_config {
        iam = "DISABLED"
      }
    }
  }

  runtime_platform {
    operating_system_family = "LINUX"
    cpu_architecture        = "X86_64"
  }
}

resource "aws_ecs_task_definition" "ge_web" {
  family                   = "ge_web"
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = 256
  memory                   = 512
  container_definitions    = <<TASK_DEFINITION
[
  {
    "name": "web",
    "image": "491762842334.dkr.ecr.us-east-1.amazonaws.com/great-equalizer-backend:0.0.17",
    "cpu": 256,
    "memory": 512,
    "essential": true,
    "portMappings": [
            {
               "containerPort": 3000,
               "protocol": "tcp"
            }
    ]
  }
]
TASK_DEFINITION

  runtime_platform {
    operating_system_family = "LINUX"
    cpu_architecture        = "X86_64"
  }
}

resource "aws_ecs_service" "mongo" {
  name             = "mongo"
  cluster          = aws_ecs_cluster.ge_cluster.id
  task_definition  = aws_ecs_task_definition.ge_mongo.arn
  desired_count    = 1
  launch_type      = "FARGATE"
  platform_version = "1.4.0"

  network_configuration {
    subnets          = [aws_subnet.private.id]
    security_groups  = [aws_security_group.mongo_private_sg.id]
    assign_public_ip = false
  }
}

resource "aws_ecs_service" "web" {
  name             = "web"
  cluster          = aws_ecs_cluster.ge_cluster.id
  task_definition  = aws_ecs_task_definition.ge_web.arn
  desired_count    = 1
  launch_type      = "FARGATE"
  platform_version = "1.4.0"

  load_balancer {
    target_group_arn = aws_lb_target_group.ge_web.arn
    container_name   = "web"
    container_port   = 3000
  }

  network_configuration {
    subnets          = [aws_subnet.public_1.id]
    security_groups  = [aws_security_group.web_server_sg.id]
    assign_public_ip = true
  }
}

resource "aws_iam_role" "ecs_task_execution_role" {
  name               = "task_role"
  assume_role_policy = <<EOF
{
  "Version": "2008-10-17",
  "Statement": [
      {
          "Sid": "",
          "Effect": "Allow",
          "Principal": {
              "Service": "ecs-tasks.amazonaws.com"
          },
          "Action": "sts:AssumeRole"
      }
  ]
}
EOF
}

resource "aws_iam_role_policy_attachment" "ecs_task_execution_role_policy_attachment" {
  role       = aws_iam_role.ecs_task_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"

}