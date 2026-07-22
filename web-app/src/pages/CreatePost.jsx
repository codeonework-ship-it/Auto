import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import ImageUploader from '../components/upload/ImageUploader';
import RichTextEditor from '../components/editor/RichTextEditor';
import postsApi from '../api/posts';

/*
 * CreatePost — combines ImageUploader (up to 20 images) + RichTextEditor.
 * Protected route (requires auth). Notes the signup-required-to-comment policy.
 */
export default function CreatePost() {
  const navigate = useNavigate();
  const [images, setImages] = useState([]);
  const [body, setBody] = useState('');
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { category: 'CAR' } });

  async function onSubmit(values) {
    setServerError('');
    try {
      // 1) Create the post with title/category/body.
      const created = await postsApi.create({ ...values, bodyHtml: body });
      // 2) Upload images to the new post (if any).
      if (images.length > 0 && created?.id) {
        await postsApi.uploadImages(created.id, images);
      }
      navigate(`/posts/${created?.id ?? ''}`);
    } catch (err) {
      setServerError(err?.message || 'Failed to publish post.');
    }
  }

  return (
    <Container className="py-4">
      <Row className="justify-content-center">
        <Col lg={9}>
          <h2 className="fw-bold mb-1">Create a post</h2>
          <p className="ah-muted">Share your car or bike with the community.</p>

          <Alert variant="info" className="small">
            Note: readers must <strong>sign up to comment</strong> on your post. Anyone can
            read, but only registered members can leave reviews and comments.
          </Alert>

          {serverError && <Alert variant="danger">{serverError}</Alert>}

          <Form onSubmit={handleSubmit(onSubmit)} noValidate>
            <Card className="ah-card border-0 mb-3">
              <Card.Body>
                <Row className="g-3">
                  <Col md={8}>
                    <Form.Group>
                      <Form.Label>Title</Form.Label>
                      <Form.Control
                        placeholder="e.g. My 2024 Royal Enfield Himalayan build"
                        isInvalid={!!errors.title}
                        {...register('title', { required: 'Title is required' })}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.title?.message}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Category</Form.Label>
                      <Form.Select {...register('category', { required: true })}>
                        <option value="CAR">Car</option>
                        <option value="BIKE">Bike</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            <Card className="ah-card border-0 mb-3">
              <Card.Body>
                <Form.Label>Images</Form.Label>
                <ImageUploader onChange={setImages} maxFiles={20} />
              </Card.Body>
            </Card>

            <Card className="ah-card border-0 mb-3">
              <Card.Body>
                <Form.Label>Details</Form.Label>
                <RichTextEditor value={body} onChange={setBody} />
              </Card.Body>
            </Card>

            <div className="d-flex gap-2">
              <Button type="submit" variant="primary" disabled={isSubmitting}>
                {isSubmitting ? 'Publishing…' : 'Publish post'}
              </Button>
              <Button variant="outline-secondary" onClick={() => navigate(-1)}>
                Cancel
              </Button>
            </div>
          </Form>
        </Col>
      </Row>
    </Container>
  );
}
