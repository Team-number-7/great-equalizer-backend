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
  ttl     = "86400"
  records = [aws_lb.mongo_lb.dns_name]
}

resource "aws_route53_record" "cname-record" {
  zone_id = aws_route53_zone.gequalizer_public.zone_id
  name    = "api.gequalizer.com"
  type    = "CNAME"
  ttl     = "86400"
  records = [aws_alb.api_lb.dns_name]
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
