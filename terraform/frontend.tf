resource "aws_ecs_service" "frontend" {
  name             = "frontend"
  cluster          = aws_ecs_cluster.ge_cluster.id
  task_definition  = aws_ecs_task_definition.frontend.arn
  desired_count    = 1
  launch_type      = "FARGATE"
  platform_version = "1.4.0"

  load_balancer {
    target_group_arn = aws_lb_target_group.frontend.arn
    container_name   = "frontend"
    container_port   = 3000
  }

  network_configuration {
    subnets          = [aws_subnet.public_1.id]
    security_groups  = [aws_security_group.frontend_server_sg.id]
    assign_public_ip = true
  }
}

resource "aws_ecs_task_definition" "frontend" {
  family                   = "frontend"
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = 256
  memory                   = 512
  container_definitions    = <<TASK_DEFINITION
[
  {
    "name": "frontend",
    "image": "491762842334.dkr.ecr.us-east-1.amazonaws.com/great-equalizer-frontend:0.0.17",
    "cpu": 256,
    "memory": 512,
    "essential": true,
    "portMappings": [
            {
               "containerPort": 3000,
               "protocol": "tcp"
            }
    ],
    "logConfiguration": {
          "logDriver": "awslogs",
          "options": {
            "awslogs-group": "${var.cloudwatch_frontend_group}",
            "awslogs-region": "us-east-1",
            "awslogs-stream-prefix": "ecs"
          }
    }
  }
]
TASK_DEFINITION

  runtime_platform {
    operating_system_family = "LINUX"
    cpu_architecture        = "X86_64"
  }

  lifecycle {
    ignore_changes = [
      container_definitions
    ]
  }
}

resource "aws_cloudwatch_log_group" "cloudwatch_frontend_group" {
  name              = var.cloudwatch_frontend_group
  retention_in_days = 1
}

resource "aws_lb_target_group" "frontend" {
  name        = "ge-frontend-lb-tg"
  port        = 3000
  protocol    = "HTTP"
  target_type = "ip"
  vpc_id      = aws_vpc.team_7.id
  health_check {
    enabled  = true
    interval = 60
    path     = "/"
  }
}

resource "aws_alb" "frontend_lb" {
  name               = "frontend-lb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.load_balancer_sg.id]
  subnets            = [aws_subnet.public_1.id, aws_subnet.public_2.id]
}

resource "aws_security_group" "frontend_server_sg" {
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

resource "aws_lb_listener" "frontend_lb_listener" {
  load_balancer_arn = aws_alb.frontend_lb.arn
  port              = "443"
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-2016-08"
  certificate_arn   = aws_acm_certificate_validation.gequalizer_validation.certificate_arn

  default_action {
    target_group_arn = aws_lb_target_group.frontend.arn
    type             = "forward"
  }
}

resource "aws_ecr_repository" "great-equalizer-frontend" {
  name                 = "great-equalizer-frontend"
  image_tag_mutability = "IMMUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  encryption_configuration {
    encryption_type = "KMS"
  }
}
