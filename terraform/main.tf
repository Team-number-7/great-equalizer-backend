terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.19"
    }
  }

  required_version = ">= 1.2.3"

  backend "s3" {
    bucket = "tf-backend-bucket-gequalizer"
    region = "us-east-1"
    key    = "terraform.tfstate"
  }
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

resource "aws_s3_bucket" "backend" {
  bucket = "tf-backend-bucket-gequalizer"
}

resource "aws_s3_bucket_acl" "backend_bucket_acl" {
  bucket = aws_s3_bucket.backend.id
  acl    = "private"
}

resource "aws_vpc" "team_7" {
  cidr_block           = "12.0.0.0/16"
  enable_dns_hostnames = true

  tags = {
    "Name" = "Team 7 web"
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
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.nat_gateway.id
  }
}

resource "aws_subnet" "private_1" {
  vpc_id                  = aws_vpc.team_7.id
  cidr_block              = "12.0.2.0/24"
  map_public_ip_on_launch = false
  availability_zone       = "us-east-1a"

  tags = {
    "Name" = "Subnet private 1"
  }
}

resource "aws_subnet" "private_2" {
  vpc_id                  = aws_vpc.team_7.id
  cidr_block              = "12.0.3.0/24"
  map_public_ip_on_launch = false
  availability_zone       = "us-east-1b"

  tags = {
    "Name" = "Subnet private 2"
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

resource "aws_route_table_association" "rtba_private_1" {
  subnet_id      = aws_subnet.private_1.id
  route_table_id = aws_route_table.routing_table_private.id
}

resource "aws_route_table_association" "rtba_private_2" {
  subnet_id      = aws_subnet.private_2.id
  route_table_id = aws_route_table.routing_table_private.id
}

resource "aws_security_group" "load_balancer_sg_web" {
  vpc_id = aws_vpc.team_7.id
  ingress {
    cidr_blocks = ["0.0.0.0/0"]
    description = "HTTPS from everywhere"
    from_port   = 443
    to_port     = 443
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
  security_groups    = [aws_security_group.load_balancer_sg_web.id]
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

resource "aws_lb_listener" "alb_listener" {
  load_balancer_arn = aws_alb.web_lb.arn
  port              = "443"
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-2016-08"
  certificate_arn   = aws_acm_certificate_validation.gequalizer_validation.certificate_arn

  default_action {
    target_group_arn = aws_lb_target_group.ge_web.arn
    type             = "forward"
  }
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

resource "aws_cloudwatch_log_group" "cloudwatch_mongo_group" {
  name              = var.cloudwatch_mongo_group
  retention_in_days = 1
}

resource "aws_cloudwatch_log_group" "cloudwatch_web_group" {
  name              = var.cloudwatch_web_group
  retention_in_days = 1
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
    "image": "491762842334.dkr.ecr.us-east-1.amazonaws.com/great-equalizer-backend:0.0.26",
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
            "awslogs-group": "${var.cloudwatch_web_group}",
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

resource "aws_route53_zone" "great_equalizer_private" {
  name = "great-equalizer.private"

  vpc {
    vpc_id = aws_vpc.team_7.id
  }
}

resource "aws_route53_zone" "gequalizer_public" {
  name = "gequalizer.com"
}

resource "aws_route53_record" "dev-ns" {
  zone_id = aws_route53_zone.great_equalizer_private.zone_id
  name    = "mongo.great-equalizer.private"
  type    = "CNAME"
  ttl     = "172800"
  records = [aws_lb.mongo_lb.dns_name]
}

resource "aws_route53_record" "cname-record" {
  zone_id = aws_route53_zone.gequalizer_public.zone_id
  name    = "api.gequalizer.com"
  type    = "CNAME"
  ttl     = "172800"
  records = [aws_alb.web_lb.dns_name]
}

resource "aws_route53_record" "cname-record-www" {
  zone_id = aws_route53_zone.gequalizer_public.zone_id
  name    = "www.gequalizer.com"
  type    = "CNAME"
  ttl     = "60"
  records = ["gequalizer.com"]
}


resource "aws_route53_record" "a-record" {
  zone_id = aws_route53_zone.gequalizer_public.zone_id
  name    = "gequalizer.com"
  type    = "A"
  ttl     = 60
  records = [
    "185.199.108.153",
    "185.199.109.153",
    "185.199.110.153",
    "185.199.111.153",
  ]
}

resource "aws_route53_record" "aaaa-record" {
  zone_id = aws_route53_zone.gequalizer_public.zone_id
  name    = "gequalizer.com"
  type    = "AAAA"
  ttl     = 60
  records = [
    "2606:50c0:8000::153",
    "2606:50c0:8001::153",
    "2606:50c0:8002::153",
    "2606:50c0:8003::153",
  ]
}

resource "aws_route53_record" "txt-record" {
  zone_id = aws_route53_zone.gequalizer_public.zone_id
  name    = "_github-pages-challenge-team-number-7.gequalizer.com"
  type    = "TXT"
  ttl     = 60
  records = [
    "b16ab3502fc9275d716482fc8dfb65",
  ]
}

resource "aws_acm_certificate" "cert" {
  domain_name               = "gequalizer.com"
  validation_method         = "DNS"
  subject_alternative_names = ["*.gequalizer.com"]

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_route53_record" "gequalizer_public_validation" {
  for_each = {
    for dvo in aws_acm_certificate.cert.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }

  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = aws_route53_zone.gequalizer_public.zone_id
}

resource "aws_acm_certificate_validation" "gequalizer_validation" {
  certificate_arn         = aws_acm_certificate.cert.arn
  validation_record_fqdns = [for record in aws_route53_record.gequalizer_public_validation : record.fqdn]
}
