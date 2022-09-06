resource "aws_ecs_service" "mongo" {
  name             = "mongo"
  cluster          = aws_ecs_cluster.ge_cluster.id
  task_definition  = aws_ecs_task_definition.ge_mongo.arn
  desired_count    = 1
  launch_type      = "FARGATE"
  platform_version = "1.4.0"

  load_balancer {
    target_group_arn = aws_lb_target_group.ge_mongo.arn
    container_name   = "mongo"
    container_port   = 27017
  }

  network_configuration {
    subnets          = [aws_subnet.private_1.id]
    security_groups  = [aws_security_group.mongo_private_sg.id]
    assign_public_ip = false
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
            ],
    "logConfiguration": {
          "logDriver": "awslogs",
          "options": {
            "awslogs-group": "${var.cloudwatch_mongo_group}",
            "awslogs-region": "us-east-1",
            "awslogs-stream-prefix": "ecs"
          }
    }
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

resource "aws_cloudwatch_log_group" "cloudwatch_mongo_group" {
  name              = var.cloudwatch_mongo_group
  retention_in_days = 1
}

resource "aws_lb" "mongo_lb" {
  name               = "mongo-lb"
  internal           = true
  load_balancer_type = "network"
  subnets            = [aws_subnet.private_1.id, aws_subnet.private_2.id]
}

resource "aws_lb_target_group" "ge_mongo" {
  name        = "ge-mongo-lb-tg"
  port        = 27017
  protocol    = "TCP"
  target_type = "ip"
  vpc_id      = aws_vpc.team_7.id
}

resource "aws_lb_listener" "mongo_listener" {
  load_balancer_arn = aws_lb.mongo_lb.arn
  port              = 27017
  protocol          = "TCP"

  default_action {
    target_group_arn = aws_lb_target_group.ge_mongo.arn
    type             = "forward"
  }
}

resource "aws_efs_file_system" "mongo_private_efs" {
  encrypted              = true
  availability_zone_name = "us-east-1a"
}

resource "aws_efs_mount_target" "mongo_efs_mt" {
  file_system_id  = aws_efs_file_system.mongo_private_efs.id
  subnet_id       = aws_subnet.private_1.id
  security_groups = [aws_security_group.efs_private_sg.id]
}

resource "aws_security_group" "efs_private_sg" {
  vpc_id = aws_vpc.team_7.id
  ingress {
    description     = "NFS from everywhere"
    from_port       = 2049
    to_port         = 2049
    protocol        = "tcp"
    security_groups = [aws_security_group.mongo_private_sg.id]
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
    cidr_blocks = ["12.0.0.0/16"]
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